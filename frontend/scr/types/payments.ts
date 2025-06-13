// src/types/payments.ts
import { PaymentStatus } from './common';

export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'VNPAY';

export type PaymentDto = {
    order_id: string;
    payment_method: PaymentMethod;
    vnpay_transaction_id?: string;
    vnpay_transaction_datetime?: string;
    vnpay_transaction_content?: string;
};

export type PaymentInfo = {
    payment_id: string;
    order_id: string;
    amount: number;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod;
    vnpay_transaction_id?: string;
    vnpay_transaction_datetime?: string;
    vnpay_transaction_content?: string;
    created_at: string;
};

export type RefundInfo = {
    refund_id: string;
    payment_id: string;
    amount: number;
    status: string;
    vnpay_refund_transaction_id?: string;
    refund_datetime: string;
    refund_reason?: string;
};

export type PaymentUrlRequest = {
    order_id: string;
    amount: number;
    payment_method?: string;
    order_info?: string;
};

export type TransactionStatus = {
    vnp_ResponseCode: string;
    vnp_TransactionStatus: string;
    vnp_Message: string;
    vnp_TransactionNo: string;
};