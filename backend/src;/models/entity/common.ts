export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'VNPAY' | 'PAYPAL' | 'STRIPE' | 'MOMO';
export type DeliveryType = 'STANDARD' | 'RUSH';
export type OrderStatus = 'PENDING_PROCESSING' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
// Parameters for processing a payment
export interface ProcessPaymentParams {
    orderId: string;
    payment_method: PaymentMethod;
    transaction_id: string;
    transaction_datetime: Date;
    transaction_content: string;
    provider_data?: any;
}