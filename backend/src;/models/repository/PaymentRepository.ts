// src/models/repository/PaymentRepository.ts
import { IDatabaseConnection } from '../../config/interfaces';
import { 
    IPaymentRepository,
    RecordPaymentTransactionParams,
    RecordVNPayTransactionParams,
    RefundPaymentParams,
    PaymentTransactionInfo,
    PaymentByTransactionInfo,
    FullOrderPaymentInfo
} from '../interfaces/IPaymentRepository';
import { Payment, VNPayPayment, PayPalPayment, StripePayment, MoMoPayment } from '../entity/PaymentTransaction';
import { PaymentMethod, PaymentStatus } from '../entity/common';

export class PaymentRepository implements IPaymentRepository {
    private db: IDatabaseConnection;
    
    constructor(db: IDatabaseConnection) {
        this.db = db;
    }

    /**
     * Create payment record using database function
     */
    async createPayment(orderId: string, amount: number, paymentMethod: PaymentMethod): Promise<string> {
        try {
            const result = await this.db.query<{ payment_id: string }>(
                'SELECT create_payment($1, $2, $3) as payment_id',
                [orderId, amount, paymentMethod]
            );
            
            return result[0].payment_id;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update payment status using database function
     */
    async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<boolean> {
        try {
            const result = await this.db.query<{ success: boolean }>(
                'SELECT update_payment_status($1, $2) as success',
                [paymentId, status]
            );
            
            return result[0].success;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Record payment transaction details
     */
    async recordPaymentTransaction(params: RecordPaymentTransactionParams): Promise<boolean> {
        try {
            const result = await this.db.query<{ success: boolean }>(
                'SELECT record_payment_transaction($1, $2, $3, $4, $5, $6) as success',
                [
                    params.payment_id,
                    params.transaction_id,
                    params.transaction_datetime,
                    params.transaction_content,
                    params.transaction_status,
                    params.provider_data
                ]
            );
            
            return result[0].success;
        } catch (error) {
            console.error('Error recording payment transaction:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Record VNPay specific transaction details
     */
    async recordVNPayTransaction(params: RecordVNPayTransactionParams): Promise<boolean> {
        try {
            const result = await this.db.query<{ success: boolean }>(
                'SELECT record_vnpay_transaction($1, $2, $3, $4, $5) as success',
                [
                    params.payment_id,
                    params.transaction_id,
                    params.transaction_datetime,
                    params.transaction_content,
                    params.transaction_status
                ]
            );
            
            return result[0].success;
        } catch (error) {
            console.error('Error recording VNPay transaction:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Process payment refund
     */
    async refundPayment(params: RefundPaymentParams): Promise<string> {
        try {
            const result = await this.db.query<{ refund_id: string }>(
                'SELECT refund_payment($1, $2, $3, $4) as refund_id',
                [
                    params.payment_id,
                    params.refund_reason,
                    params.refund_transaction_id,
                    params.provider_data
                ]
            );
            
            return result[0].refund_id;
        } catch (error) {
            console.error('Error processing refund:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get payment by ID and create appropriate Payment instance
     */
    async getPaymentById(paymentId: string): Promise<Payment | null> {
        try {
            const result = await this.db.query(
                'SELECT * FROM payments WHERE id = $1',
                [paymentId]
            );
            
            if (result.length === 0) {
                return null;
            }
            
            const paymentData = result[0];
            return this.createPaymentFromData(paymentData);
        } catch (error) {
            console.error('Error getting payment by ID:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get payment transaction information for an order
     */
    async getPaymentTransactionInfo(orderId: string): Promise<PaymentTransactionInfo> {
        try {
            const result = await this.db.query<PaymentTransactionInfo>(
                'SELECT * FROM get_payment_transaction_info($1)',
                [orderId]
            );
            
            if (result.length === 0) {
                throw new Error(`No payment transaction found for order: ${orderId}`);
            }
            
            return result[0];
        } catch (error) {
            console.error('Error getting payment transaction info:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get payment by transaction ID
     */
    async getPaymentByTransactionId(transactionId: string): Promise<PaymentByTransactionInfo> {
        try {
            const result = await this.db.query<PaymentByTransactionInfo>(
                'SELECT * FROM get_payment_by_transaction_id($1)',
                [transactionId]
            );
            
            if (result.length === 0) {
                throw new Error(`No payment found for transaction ID: ${transactionId}`);
            }
            
            return result[0];
        } catch (error) {
            console.error('Error getting payment by transaction ID:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get full order payment information including refunds
     */
    async getFullOrderPaymentInfo(orderId: string): Promise<FullOrderPaymentInfo> {
        try {
            const result = await this.db.query<FullOrderPaymentInfo>(
                'SELECT * FROM get_full_order_payment_info($1)',
                [orderId]
            );
            
            if (result.length === 0) {
                throw new Error(`No payment information found for order: ${orderId}`);
            }
            
            return result[0];
        } catch (error) {
            console.error('Error getting full order payment info:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if payment can be refunded
     */
    async canRefundPayment(paymentId: string): Promise<boolean> {
        try {
            const payment = await this.getPaymentById(paymentId);
            
            if (!payment) {
                return false;
            }
            
            return payment.canRefund();
        } catch (error) {
            console.error('Error checking refund eligibility:', error);
            return false;
        }
    }

    /**
     * Check if payment is completed
     */
    async isPaymentCompleted(paymentId: string): Promise<boolean> {
        try {
            const payment = await this.getPaymentById(paymentId);
            
            if (!payment) {
                return false;
            }
            
            return payment.isCompleted();
        } catch (error) {
            console.error('Error checking payment completion:', error);
            return false;
        }
    }

    /**
     * Create Payment instance from database data using Factory pattern
     */
    private createPaymentFromData(paymentData: any): Payment {
        let payment: Payment;
        
        // Create appropriate Payment subclass based on payment method
        switch (paymentData.payment_method) {
            case 'VNPAY':
                payment = new VNPayPayment();
                // Set VNPay specific properties from provider_data if available
                if (paymentData.provider_data) {
                    (payment as VNPayPayment).vnpay_transaction_no = paymentData.provider_data.vnpay_transaction_no;
                    (payment as VNPayPayment).vnpay_bank_code = paymentData.provider_data.vnpay_bank_code;
                    (payment as VNPayPayment).vnpay_card_type = paymentData.provider_data.vnpay_card_type;
                    (payment as VNPayPayment).vnpay_response_code = paymentData.provider_data.vnpay_response_code;
                }
                break;
            case 'PAYPAL':
                payment = new PayPalPayment();
                if (paymentData.provider_data) {
                    (payment as PayPalPayment).paypal_payment_id = paymentData.provider_data.paypal_payment_id;
                    (payment as PayPalPayment).paypal_payer_id = paymentData.provider_data.paypal_payer_id;
                }
                break;
            case 'STRIPE':
                payment = new StripePayment();
                if (paymentData.provider_data) {
                    (payment as StripePayment).stripe_payment_intent_id = paymentData.provider_data.stripe_payment_intent_id;
                    (payment as StripePayment).stripe_charge_id = paymentData.provider_data.stripe_charge_id;
                }
                break;
            case 'MOMO':
                payment = new MoMoPayment();
                if (paymentData.provider_data) {
                    (payment as MoMoPayment).momo_transaction_id = paymentData.provider_data.momo_transaction_id;
                    (payment as MoMoPayment).momo_order_info = paymentData.provider_data.momo_order_info;
                }
                break;
            case 'CREDIT_CARD':
            default:
                // For credit cards and other payment methods, use VNPayPayment as base
                payment = new VNPayPayment();
                break;
        }
        
        // Set common payment properties - handle both direct fields and aliased fields
        payment.id = paymentData.payment_id || paymentData.id;
        payment.order_id = paymentData.order_id;
        payment.amount = paymentData.payment_amount || paymentData.amount;
        payment.payment_status = paymentData.payment_status;
        payment.payment_method = paymentData.payment_method;
        payment.transaction_id = paymentData.transaction_id;
        payment.transaction_datetime = paymentData.transaction_datetime;
        payment.transaction_content = paymentData.transaction_content;
        payment.provider_data = paymentData.provider_data;
        payment.created_at = paymentData.created_at;
        payment.updated_at = paymentData.updated_at;
        
        return payment;
    }
}