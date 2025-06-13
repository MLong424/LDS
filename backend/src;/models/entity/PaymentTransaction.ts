// src/models/entity/PaymentTransaction.ts
import { PaymentMethod, PaymentStatus } from './common';

// Base Payment class using Template Method Pattern
export abstract class Payment {
    id!: string;
    order_id!: string;
    amount!: number;
    payment_status!: PaymentStatus;
    payment_method!: PaymentMethod;
    transaction_id?: string;
    transaction_datetime?: Date;
    transaction_content?: string;
    provider_data?: any; // To match the jsonb in database
    created_at!: Date;
    updated_at!: Date;

    /**
     * Template method for payment validation
     * This method defines the structure for payment validation
     */
    public validatePayment(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.validateBasicInfo()) {
            errors.push('Basic payment information is incomplete');
        }

        if (!this.validateAmount()) {
            errors.push('Payment amount is invalid');
        }

        if (!this.validatePaymentMethod()) {
            errors.push('Payment method is invalid');
        }

        const customValidation = this.performCustomValidation();
        if (!customValidation.isValid) {
            errors.push(...customValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Template method for payment processing
     * This method defines the structure for payment processing
     */
    public processPayment(): { success: boolean; message: string; transactionId?: string } {
        try {
            // Pre-processing validation
            const validation = this.validatePayment();
            if (!validation.isValid) {
                return {
                    success: false,
                    message: `Validation failed: ${validation.errors.join(', ')}`
                };
            }

            // Process payment
            const processingResult = this.executePaymentProcessing();
            
            if (processingResult.success) {
                this.updatePaymentStatus('COMPLETED');
                this.recordTransactionDetails(processingResult.transactionId || '');
            } else {
                this.updatePaymentStatus('FAILED');
            }

            return processingResult;
        } catch (error) {
            this.updatePaymentStatus('FAILED');
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Payment processing failed'
            };
        }
    }

    /**
     * Template method for refund processing
     * This method defines the structure for refund processing
     */
    public processRefund(refundAmount: number, reason: string): { success: boolean; message: string; refundId?: string } {
        try {
            if (!this.canRefund()) {
                return {
                    success: false,
                    message: 'Payment cannot be refunded in current status'
                };
            }

            if (!this.validateRefundAmount(refundAmount)) {
                return {
                    success: false,
                    message: 'Invalid refund amount'
                };
            }

            const refundResult = this.executeRefundProcessing(refundAmount, reason);
            
            if (refundResult.success) {
                this.updatePaymentStatus('REFUNDED');
            }

            return refundResult;
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Refund processing failed'
            };
        }
    }

    /**
     * Template method for payment status transitions
     */
    public canTransitionTo(newStatus: PaymentStatus): { canTransition: boolean; reason?: string } {
        const currentStatus = this.getPaymentStatus();
        
        if (!this.isValidStatusTransition(currentStatus, newStatus)) {
            return {
                canTransition: false,
                reason: `Cannot transition from ${currentStatus} to ${newStatus}`
            };
        }

        const customValidation = this.validateCustomStatusTransition(currentStatus, newStatus);
        if (!customValidation.canTransition) {
            return customValidation;
        }

        return { canTransition: true };
    }

    // Common methods that can be overridden by subclasses
    protected validateBasicInfo(): boolean {
        return !!(
            this.id &&
            this.order_id &&
            this.payment_method
        );
    }

    protected validateAmount(): boolean {
        return this.amount > 0;
    }

    protected validatePaymentMethod(): boolean {
        const validMethods: PaymentMethod[] = ['CREDIT_CARD', 'VNPAY', 'PAYPAL', 'STRIPE', 'MOMO'];
        return validMethods.includes(this.payment_method);
    }

    protected validateRefundAmount(refundAmount: number): boolean {
        return refundAmount > 0 && refundAmount <= this.amount;
    }

    protected isValidStatusTransition(currentStatus: PaymentStatus, newStatus: PaymentStatus): boolean {
        const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
            'PENDING': ['COMPLETED', 'FAILED'],
            'COMPLETED': ['REFUNDED'],
            'FAILED': ['PENDING'], // Allow retry
            'REFUNDED': []
        };

        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    protected updatePaymentStatus(status: PaymentStatus): void {
        this.payment_status = status;
        this.updated_at = new Date();
    }

    protected recordTransactionDetails(transactionId: string): void {
        this.transaction_id = transactionId;
        this.transaction_datetime = new Date();
    }

    // Common utility methods
    public getPaymentStatus(): PaymentStatus {
        return this.payment_status;
    }

    public getPaymentMethod(): PaymentMethod {
        return this.payment_method;
    }

    public isCompleted(): boolean {
        return this.payment_status === 'COMPLETED';
    }

    public isPending(): boolean {
        return this.payment_status === 'PENDING';
    }

    public isFailed(): boolean {
        return this.payment_status === 'FAILED';
    }

    public isRefunded(): boolean {
        return this.payment_status === 'REFUNDED';
    }

    public canRefund(): boolean {
        return this.payment_status === 'COMPLETED';
    }

    public getFormattedAmount(): string {
        return this.amount.toLocaleString('en-US', { style: 'currency', currency: 'VND' });
    }

    public getTransactionAge(): number {
        if (!this.transaction_datetime) return 0;
        return Date.now() - this.transaction_datetime.getTime();
    }

    // Abstract methods that subclasses must implement
    public abstract getPaymentType(): string;
    protected abstract performCustomValidation(): { isValid: boolean; errors: string[] };
    protected abstract executePaymentProcessing(): { success: boolean; message: string; transactionId?: string };
    protected abstract executeRefundProcessing(amount: number, reason: string): { success: boolean; message: string; refundId?: string };
    protected abstract validateCustomStatusTransition(
        currentStatus: PaymentStatus,
        newStatus: PaymentStatus
    ): { canTransition: boolean; reason?: string };

    // toJSON method to prevent circular references
    public toJSON(): any {
        return {
            id: this.id,
            order_id: this.order_id,
            amount: this.amount,
            payment_status: this.payment_status,
            payment_method: this.payment_method,
            transaction_id: this.transaction_id,
            transaction_datetime: this.transaction_datetime,
            transaction_content: this.transaction_content,
            provider_data: this.provider_data,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

// VNPay Payment implementation
export class VNPayPayment extends Payment {
    vnpay_transaction_no?: string;
    vnpay_bank_code?: string;
    vnpay_card_type?: string;
    vnpay_response_code?: string;

    public getPaymentType(): string {
        return 'VNPAY';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (this.payment_method !== 'VNPAY') {
            errors.push('Payment method must be VNPAY for VNPay payments');
        }

        // VNPay specific validations
        if (this.amount < 10000) { // Minimum 10,000 VND
            errors.push('VNPay payment minimum amount is 10,000 VND');
        }

        if (this.amount > 500000000) { // Maximum 500M VND
            errors.push('VNPay payment maximum amount is 500,000,000 VND');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected executePaymentProcessing(): { success: boolean; message: string; transactionId?: string } {
        // This would integrate with VNPay API
        // For now, return a mock implementation
        const mockTransactionId = `VNP${Date.now()}`;
        
        // Simulate processing
        const isSuccess = Math.random() > 0.1; // 90% success rate for simulation
        
        if (isSuccess) {
            this.vnpay_transaction_no = mockTransactionId;
            this.vnpay_response_code = '00'; // Success code
            return {
                success: true,
                message: 'VNPay payment processed successfully',
                transactionId: mockTransactionId
            };
        } else {
            this.vnpay_response_code = '99'; // Failed code
            return {
                success: false,
                message: 'VNPay payment processing failed'
            };
        }
    }

    protected executeRefundProcessing(amount: number, reason: string): { success: boolean; message: string; refundId?: string } {
        // This would integrate with VNPay refund API
        const mockRefundId = `VNPRF${Date.now()}`;
        
        // Simulate refund processing
        const isSuccess = Math.random() > 0.05; // 95% success rate for refunds
        
        if (isSuccess) {
            return {
                success: true,
                message: 'VNPay refund processed successfully',
                refundId: mockRefundId
            };
        } else {
            return {
                success: false,
                message: 'VNPay refund processing failed'
            };
        }
    }

    protected validateCustomStatusTransition(
        currentStatus: PaymentStatus,
        newStatus: PaymentStatus
    ): { canTransition: boolean; reason?: string } {
        // VNPay specific transition rules
        if (currentStatus === 'PENDING' && newStatus === 'COMPLETED') {
            if (!this.vnpay_transaction_no) {
                return {
                    canTransition: false,
                    reason: 'VNPay transaction number required for completion'
                };
            }
        }

        return { canTransition: true };
    }

    public getVNPayResponseCode(): string | undefined {
        return this.vnpay_response_code;
    }

    public getVNPayTransactionNo(): string | undefined {
        return this.vnpay_transaction_no;
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            vnpay_transaction_no: this.vnpay_transaction_no,
            vnpay_bank_code: this.vnpay_bank_code,
            vnpay_card_type: this.vnpay_card_type,
            vnpay_response_code: this.vnpay_response_code
        };
    }
}

// PayPal Payment implementation
export class PayPalPayment extends Payment {
    paypal_payment_id?: string;
    paypal_payer_id?: string;

    public getPaymentType(): string {
        return 'PAYPAL';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (this.payment_method !== 'PAYPAL') {
            errors.push('Payment method must be PAYPAL for PayPal payments');
        }

        // PayPal specific validations
        if (this.amount < 1) { // Minimum $1 USD equivalent
            errors.push('PayPal payment minimum amount is $1 USD equivalent');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected executePaymentProcessing(): { success: boolean; message: string; transactionId?: string } {
        // This would integrate with PayPal API
        const mockTransactionId = `PP${Date.now()}`;
        
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        if (isSuccess) {
            this.paypal_payment_id = mockTransactionId;
            return {
                success: true,
                message: 'PayPal payment processed successfully',
                transactionId: mockTransactionId
            };
        } else {
            return {
                success: false,
                message: 'PayPal payment processing failed'
            };
        }
    }

    protected executeRefundProcessing(amount: number, reason: string): { success: boolean; message: string; refundId?: string } {
        const mockRefundId = `PPRF${Date.now()}`;
        const isSuccess = Math.random() > 0.05; // 95% success rate
        
        if (isSuccess) {
            return {
                success: true,
                message: 'PayPal refund processed successfully',
                refundId: mockRefundId
            };
        } else {
            return {
                success: false,
                message: 'PayPal refund processing failed'
            };
        }
    }

    protected validateCustomStatusTransition(
        currentStatus: PaymentStatus,
        newStatus: PaymentStatus
    ): { canTransition: boolean; reason?: string } {
        return { canTransition: true };
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            paypal_payment_id: this.paypal_payment_id,
            paypal_payer_id: this.paypal_payer_id
        };
    }
}

// Stripe Payment implementation
export class StripePayment extends Payment {
    stripe_payment_intent_id?: string;
    stripe_charge_id?: string;

    public getPaymentType(): string {
        return 'STRIPE';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (this.payment_method !== 'STRIPE') {
            errors.push('Payment method must be STRIPE for Stripe payments');
        }

        // Stripe specific validations
        if (this.amount < 50) { // Minimum 50 cents
            errors.push('Stripe payment minimum amount is 50 cents');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected executePaymentProcessing(): { success: boolean; message: string; transactionId?: string } {
        const mockTransactionId = `pi_${Date.now()}`;
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        if (isSuccess) {
            this.stripe_payment_intent_id = mockTransactionId;
            return {
                success: true,
                message: 'Stripe payment processed successfully',
                transactionId: mockTransactionId
            };
        } else {
            return {
                success: false,
                message: 'Stripe payment processing failed'
            };
        }
    }

    protected executeRefundProcessing(amount: number, reason: string): { success: boolean; message: string; refundId?: string } {
        const mockRefundId = `re_${Date.now()}`;
        const isSuccess = Math.random() > 0.05; // 95% success rate
        
        if (isSuccess) {
            return {
                success: true,
                message: 'Stripe refund processed successfully',
                refundId: mockRefundId
            };
        } else {
            return {
                success: false,
                message: 'Stripe refund processing failed'
            };
        }
    }

    protected validateCustomStatusTransition(
        currentStatus: PaymentStatus,
        newStatus: PaymentStatus
    ): { canTransition: boolean; reason?: string } {
        return { canTransition: true };
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            stripe_payment_intent_id: this.stripe_payment_intent_id,
            stripe_charge_id: this.stripe_charge_id
        };
    }
}

// MoMo Payment implementation
export class MoMoPayment extends Payment {
    momo_transaction_id?: string;
    momo_order_info?: string;

    public getPaymentType(): string {
        return 'MOMO';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (this.payment_method !== 'MOMO') {
            errors.push('Payment method must be MOMO for MoMo payments');
        }

        // MoMo specific validations
        if (this.amount < 10000) { // Minimum 10,000 VND
            errors.push('MoMo payment minimum amount is 10,000 VND');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected executePaymentProcessing(): { success: boolean; message: string; transactionId?: string } {
        const mockTransactionId = `MOMO${Date.now()}`;
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        if (isSuccess) {
            this.momo_transaction_id = mockTransactionId;
            return {
                success: true,
                message: 'MoMo payment processed successfully',
                transactionId: mockTransactionId
            };
        } else {
            return {
                success: false,
                message: 'MoMo payment processing failed'
            };
        }
    }

    protected executeRefundProcessing(amount: number, reason: string): { success: boolean; message: string; refundId?: string } {
        const mockRefundId = `MOMOREF${Date.now()}`;
        const isSuccess = Math.random() > 0.05; // 95% success rate
        
        if (isSuccess) {
            return {
                success: true,
                message: 'MoMo refund processed successfully',
                refundId: mockRefundId
            };
        } else {
            return {
                success: false,
                message: 'MoMo refund processing failed'
            };
        }
    }

    protected validateCustomStatusTransition(
        currentStatus: PaymentStatus,
        newStatus: PaymentStatus
    ): { canTransition: boolean; reason?: string } {
        return { canTransition: true };
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            momo_transaction_id: this.momo_transaction_id,
            momo_order_info: this.momo_order_info
        };
    }
}