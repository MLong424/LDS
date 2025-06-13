// src/models/interfaces/IPaymentRepository.ts
import { Payment, VNPayPayment } from '../entity/PaymentTransaction';
import { PaymentMethod, PaymentStatus } from '../entity/common';

// Parameter interfaces for payment operations
export interface RecordPaymentTransactionParams {
    payment_id: string;
    transaction_id: string;
    transaction_datetime: Date;
    transaction_content: string;
    transaction_status: string;
    provider_data?: any;
}

export interface RecordVNPayTransactionParams {
    payment_id: string;
    transaction_id: string;
    transaction_datetime: Date;
    transaction_content: string;
    transaction_status: string;
}

export interface RefundPaymentParams {
    payment_id: string;
    refund_reason: string;
    refund_transaction_id?: string;
    provider_data?: any;
}

export interface PaymentTransactionInfo {
    payment_id: string;
    transaction_id: string;
    transaction_datetime: Date;
    transaction_content: string;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod;
    payment_amount: number;
    provider_data: any;
    refund_info: any;
}

export interface PaymentByTransactionInfo {
    payment_id: string;
    order_id: string;
    payment_status: PaymentStatus;
    payment_amount: number;
    payment_method: PaymentMethod;
    transaction_datetime: Date;
    transaction_content: string;
    provider_data: any;
}

export interface FullOrderPaymentInfo {
    order_id: string;
    order_status: string;
    payment_status: PaymentStatus;
    total_amount: number;
    payment_info: any[];
    refund_info: any[];
}

export interface IPaymentRepository {    
    // Save operations
    createPayment(orderId: string, amount: number, paymentMethod: PaymentMethod): Promise<string>;
    
    // Update operations
    updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<boolean>;
    
    // Record transaction details
    recordPaymentTransaction(params: RecordPaymentTransactionParams): Promise<boolean>;
    recordVNPayTransaction(params: RecordVNPayTransactionParams): Promise<boolean>;
    
    // Refund operations
    refundPayment(params: RefundPaymentParams): Promise<string>;
    
    // Read operations
    getPaymentById(paymentId: string): Promise<Payment | null>;
    getPaymentTransactionInfo(orderId: string): Promise<PaymentTransactionInfo>;
    getPaymentByTransactionId(transactionId: string): Promise<PaymentByTransactionInfo>;
    getFullOrderPaymentInfo(orderId: string): Promise<FullOrderPaymentInfo>;
    
    // Validation and status checks
    canRefundPayment(paymentId: string): Promise<boolean>;
    isPaymentCompleted(paymentId: string): Promise<boolean>;
}