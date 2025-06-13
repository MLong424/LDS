// src/services/payment/PaymentService.ts
import { PaymentResult } from '../interfaces/IPaymentService';
import { PaymentData } from '../interfaces/IPaymentStrategy';
import { IPaymentStrategy } from '../interfaces/IPaymentStrategy';
import { IPaymentService } from '../interfaces/IPaymentService';
import { PaymentStrategyFactory, PaymentStrategyType } from './PaymentStrategyFactory';
import { IPaymentRepository } from '../../models/interfaces/IPaymentRepository';
import { Payment, VNPayPayment } from '../../models/entity/PaymentTransaction';
import { PaymentMethod, PaymentStatus } from '../../models/entity/common';

export class PaymentService implements IPaymentService {
    private strategies: Map<string, IPaymentStrategy>;
    private defaultStrategy: PaymentStrategyType;
    private paymentRepository: IPaymentRepository;

    constructor(
        paymentRepository: IPaymentRepository,
        defaultStrategy: PaymentStrategyType = 'VNPAY'
    ) {
        this.paymentRepository = paymentRepository;
        this.strategies = new Map<string, IPaymentStrategy>();
        this.defaultStrategy = defaultStrategy;
        this.initializeStrategies();
    }

    /**
     * Initialize available strategies using factory (Open for extension)
     */
    private initializeStrategies(): void {
        const availableStrategies = PaymentStrategyFactory.getAvailableStrategies();
        
        for (const strategyType of availableStrategies) {
            try {
                const strategy = PaymentStrategyFactory.createStrategy(strategyType);
                this.strategies.set(strategyType, strategy);
            } catch (error) {
                console.warn(`Failed to initialize ${strategyType} strategy:`, error);
            }
        }
    }

    /**
     * Register a new strategy (Open for extension)
     */
    registerStrategy(strategy: IPaymentStrategy): void {
        this.strategies.set(strategy.getName(), strategy);
    }

    /**
     * Get available payment methods (Closed for modification)
     */
    getAvailablePaymentMethods(): string[] {
        return Array.from(this.strategies.keys());
    }

    /**
     * Set default strategy (Closed for modification)
     */
    setDefaultStrategy(strategyName: PaymentStrategyType): void {
        if (!this.strategies.has(strategyName)) {
            throw new Error(`Payment strategy '${strategyName}' is not available`);
        }
        this.defaultStrategy = strategyName;
    }

    /**
     * Create payment URL (Closed for modification)
     */
    createPaymentUrl(paymentData: PaymentData, strategyName?: string): string {
        const strategy = this.getStrategy(strategyName);
        return strategy.createPaymentUrl(paymentData);
    }

    /**
     * Verify return parameters (Closed for modification)
     */
    async verifyReturnParameters(
        params: Record<string, string>,
        strategyName?: string
    ): Promise<PaymentResult> {
        const strategy = this.getStrategy(strategyName);
        return strategy.verifyReturnParameters(params);
    }

    /**
     * Get strategy configuration requirements
     */
    getStrategyConfigurationRequirements(strategyName: PaymentStrategyType): string[] {
        return PaymentStrategyFactory.getConfigurationRequirements(strategyName);
    }

    /**
     * Check if strategy is properly configured
     */
    isStrategyConfigured(strategyName: PaymentStrategyType): boolean {
        try {
            PaymentStrategyFactory.createStrategy(strategyName);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get strategy instance (Closed for modification)
     */
    private getStrategy(strategyName?: string): IPaymentStrategy {
        const name = strategyName || this.defaultStrategy;
        const strategy = this.strategies.get(name);
        
        if (!strategy) {
            throw new Error(`Payment strategy '${name}' is not available`);
        }
        
        return strategy;
    }

    /**
     * Refresh strategies
     */
    refreshStrategies(): void {
        this.strategies.clear();
        this.initializeStrategies();
    }

    /**
     * Create payment record in database
     */
    async createPayment(orderId: string, amount: number, paymentMethod: PaymentMethod): Promise<string> {
        return await this.paymentRepository.createPayment(orderId, amount, paymentMethod);
    }


    /**
     * Process payment using Template Method pattern
     */
    async processPayment(paymentId: string): Promise<{ success: boolean; message: string; transactionId?: string }> {
        const payment = await this.paymentRepository.getPaymentById(paymentId);
        
        if (!payment) {
            throw new Error(`Payment with ID ${paymentId} not found`);
        }
        
        // Use Template Method pattern to process payment
        const result = payment.processPayment();
        
        // Update payment status in repository
        await this.paymentRepository.updatePaymentStatus(paymentId, payment.payment_status);
        
        return result;
    }

    /**
     * Process refund using Template Method pattern
     */
    async processRefund(paymentId: string, refundAmount: number, reason: string): Promise<{ success: boolean; message: string; refundId?: string }> {
        const payment = await this.paymentRepository.getPaymentById(paymentId);
        
        if (!payment) {
            throw new Error(`Payment with ID ${paymentId} not found`);
        }
        
        // Use Template Method pattern to process refund
        const result = payment.processRefund(refundAmount, reason);
        
        if (result.success) {
            // Update payment status in repository
            await this.paymentRepository.updatePaymentStatus(paymentId, payment.payment_status);
            
            // Record refund in repository
            await this.paymentRepository.refundPayment({
                payment_id: paymentId,
                refund_reason: reason,
                refund_transaction_id: result.refundId
            });
        }
        
        return result;
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId: string): Promise<Payment | null> {
        return await this.paymentRepository.getPaymentById(paymentId);
    }

    /**
     * Check if payment can be refunded
     */
    async canRefundPayment(paymentId: string): Promise<boolean> {
        return await this.paymentRepository.canRefundPayment(paymentId);
    }

    /**
     * Check if payment is completed
     */
    async isPaymentCompleted(paymentId: string): Promise<boolean> {
        return await this.paymentRepository.isPaymentCompleted(paymentId);
    }
}