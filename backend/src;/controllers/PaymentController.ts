// src/controllers/PaymentController.ts
import { Request, Response } from 'express';
import { PaymentData } from '../services/interfaces/IPaymentStrategy';
import { IOrderPaymentService, IOrderService } from '../services/interfaces/IOrderService';
import { IEmailService } from '../services/interfaces/IEmailService';
import { PaymentService } from '../services/payment/PaymentService';
import { ProcessPaymentParams } from '../models/entity/common';
import { PaymentStrategyType } from '../services/payment/PaymentStrategyFactory';
import { Payment, VNPayPayment } from '../models/entity/PaymentTransaction';
import { IPaymentRepository } from '../models/interfaces/IPaymentRepository';
import { PaymentMethod } from '../models/entity/common';

export class PaymentController {
    private paymentService: PaymentService;

    constructor(
        private orderPaymentService: IOrderPaymentService,
        private paymentRepository: IPaymentRepository,
        defaultStrategy: PaymentStrategyType = 'VNPAY'
    ) {
        this.paymentService = new PaymentService(paymentRepository, defaultStrategy);

        // Bind methods
        this.createPayment = this.createPayment.bind(this);
        this.getPaymentMethods = this.getPaymentMethods.bind(this);
        this.getPaymentMethodConfig = this.getPaymentMethodConfig.bind(this);
        this.checkPaymentMethodStatus = this.checkPaymentMethodStatus.bind(this);
    }

    async createPayment(req: Request, res: Response): Promise<void> {
        try {
            const { orderId, amount, paymentMethod, order_info } = req.body;

            if (!orderId || !amount) {
                throw new Error('Order ID and amount are required');
            }

            // Validate payment method is available
            const availableMethods = this.paymentService.getAvailablePaymentMethods();
            const selectedMethod = paymentMethod || availableMethods[0];

            if (!availableMethods.includes(selectedMethod)) {
                throw new Error(`Payment method '${selectedMethod}' is not available`);
            }

            // Create payment URL only (no database persistence yet)
            const paymentData: PaymentData = {
                orderId,
                amount,
                ipAddress: req.ip,
                orderInfo: order_info,
                currencyCode: 'VND',
                locale: 'vn',
            };

            const paymentUrl = this.paymentService.createPaymentUrl(paymentData, selectedMethod);
            if (process.env.NODE_ENV != 'production') {
                console.log('Payment URL:', paymentUrl);
            }

            res.status(200).json({
                success: true,
                paymentUrl,
                selectedMethod,
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error creating payment',
            });
        }
    }

    getPaymentMethods(req: Request, res: Response): void {
        try {
            const methods = this.paymentService.getAvailablePaymentMethods();
            const methodsWithStatus = methods.map((method) => ({
                name: method,
                configured: this.paymentService.isStrategyConfigured(method as PaymentStrategyType),
            }));

            res.json({
                success: true,
                methods: methodsWithStatus,
            });
        } catch (error) {
            console.error('Error getting payment methods:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error getting payment methods',
            });
        }
    }

    getPaymentMethodConfig(req: Request, res: Response): void {
        try {
            const { method } = req.params;

            if (!this.paymentService.getAvailablePaymentMethods().includes(method)) {
                throw new Error(`Payment method '${method}' is not supported`);
            }

            const configRequirements = this.paymentService.getStrategyConfigurationRequirements(
                method as PaymentStrategyType
            );
            const isConfigured = this.paymentService.isStrategyConfigured(method as PaymentStrategyType);

            res.json({
                success: true,
                method,
                configRequirements,
                isConfigured,
            });
        } catch (error) {
            console.error('Error getting payment method config:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error getting config',
            });
        }
    }

    checkPaymentMethodStatus(req: Request, res: Response): void {
        try {
            const methods = this.paymentService.getAvailablePaymentMethods();
            const status = methods.reduce((acc, method) => {
                acc[method] = {
                    available: true,
                    configured: this.paymentService.isStrategyConfigured(method as PaymentStrategyType),
                };
                return acc;
            }, {} as Record<string, { available: boolean; configured: boolean }>);

            res.json({
                success: true,
                status,
            });
        } catch (error) {
            console.error('Error checking payment method status:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error checking status',
            });
        }
    }
}

export class PaymentCallbackController {
    private paymentService: PaymentService;

    constructor(
        private orderPaymentService: IOrderPaymentService,
        private orderService: IOrderService,
        private emailService: IEmailService,
        private paymentRepository: IPaymentRepository,
        defaultStrategy: PaymentStrategyType = 'VNPAY'
    ) {
        this.paymentService = new PaymentService(paymentRepository, defaultStrategy);

        // Bind methods
        this.handlePaymentReturn = this.handlePaymentReturn.bind(this);
        this.handleGenericCallback = this.handleGenericCallback.bind(this);
    }

    async handlePaymentReturn(req: Request, res: Response): Promise<void> {
        try {
            // Extract payment method from query params or default to VNPAY
            const paymentMethod = (req.query.method as string) || 'VNPAY';

            const result = await this.paymentService.verifyReturnParameters(
                req.query as Record<string, string>,
                paymentMethod
            );

            await this.processPaymentResult(result);

            // Redirect to the appropriate page
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const orderId = result.orderId || '';
            const isSuccess = result.success;

            res.redirect(`${frontendUrl}/order/confirmation/${orderId}?status=${isSuccess ? 'success' : 'failed'}`);
        } catch (error) {
            console.error('Error handling payment return:', error);
            this.handlePaymentError(res, error);
        }
    }

    async handleGenericCallback(req: Request, res: Response): Promise<void> {
        try {
            const { method } = req.params;

            if (!this.paymentService.getAvailablePaymentMethods().includes(method)) {
                throw new Error(`Payment method '${method}' is not supported`);
            }

            const result = await this.paymentService.verifyReturnParameters(
                req.query as Record<string, string>,
                method
            );

            await this.processPaymentResult(result);

            res.status(200).json({
                success: result.success,
                orderId: result.orderId,
                message: result.success ? 'Payment processed successfully' : result.errorMessage,
            });
        } catch (error) {
            console.error('Error handling generic payment callback:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Payment processing error',
            });
        }
    }

    private async processPaymentResult(result: any): Promise<void> {
        if (result.success && result.orderId) {
            try {
                // Determine payment method from result or default to VNPAY
                const paymentMethod = (result.paymentMethod || 'VNPAY') as PaymentMethod;
                
                // Create payment record now that payment is successful
                const paymentId = await this.paymentService.createPayment(
                    result.orderId,
                    result.amount || 0,
                    paymentMethod
                );
                
                // Record transaction details based on payment method
                if (paymentMethod === 'VNPAY') {
                    await this.paymentRepository.recordVNPayTransaction({
                        payment_id: paymentId,
                        transaction_id: result.transactionId || '',
                        transaction_datetime: new Date(),
                        transaction_content: result.orderInfo || `Payment for Order #${result.orderId}`,
                        transaction_status: 'COMPLETED'
                    });
                } else {
                    await this.paymentRepository.recordPaymentTransaction({
                        payment_id: paymentId,
                        transaction_id: result.transactionId || '',
                        transaction_datetime: new Date(),
                        transaction_content: result.orderInfo || `Payment for Order #${result.orderId}`,
                        transaction_status: 'COMPLETED',
                        provider_data: result.providerData
                    });
                }

                // Update payment status to completed
                await this.paymentRepository.updatePaymentStatus(paymentId, 'COMPLETED');

                // Legacy: Also update via orderPaymentService for backward compatibility
                const paymentData: ProcessPaymentParams = {
                    orderId: result.orderId,
                    payment_method: paymentMethod,
                    transaction_id: result.transactionId ?? '',
                    transaction_datetime: new Date(),
                    transaction_content: result.orderInfo || `Payment for Order #${result.orderId}`,
                    provider_data: result.providerData,
                };

                await this.orderPaymentService.processPayment(paymentData);

                // Send payment confirmation email
                const orderDetails = await this.orderService.getOrderById(result.orderId);
                if (orderDetails && orderDetails.recipient_email) {
                    await this.emailService.sendOrderConfirmationEmail(orderDetails.recipient_email, orderDetails);
                }
            } catch (error) {
                console.error('Error processing payment result:', error);
                throw error;
            }
        }
    }

    private handlePaymentError(res: Response, error: any): void {
        if (process.env.NODE_ENV === 'production') {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(
                `${frontendUrl}/payment/error?message=${encodeURIComponent(
                    error instanceof Error ? error.message : 'Payment processing error'
                )}`
            );
        } else {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to process payment return',
            });
        }
    }
}