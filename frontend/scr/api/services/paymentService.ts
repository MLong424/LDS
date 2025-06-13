// src/api/services/paymentService.ts
import { axiosInstance } from '../config';
import { PaymentUrlRequest } from '@cusTypes/payments';

const paymentService = {
    // Get available payment methods
    getPaymentMethods: () =>
        axiosInstance.get<{
            success: boolean;
            methods: Array<{
                name: string;
                configured: boolean;
            }>;
        }>('/payment/methods'),

    // Get configuration requirements for payment method
    getPaymentMethodConfig: (method: string) =>
        axiosInstance.get<{
            success: boolean;
            method: string;
            configRequirements: string[];
            isConfigured: boolean;
        }>(`/payment/methods/${method}/config`),

    // Check status of all payment methods
    checkPaymentMethodStatus: () =>
        axiosInstance.get<{
            success: boolean;
            status: Record<string, { available: boolean; configured: boolean }>;
        }>('/payment/methods/status'),

    // Create payment URL for order
    createPaymentUrl: (data: PaymentUrlRequest) =>
        axiosInstance.post<{
            success: boolean;
            paymentUrl: string;
            selectedMethod: string;
        }>('/payment/create', {
            orderId: data.order_id,
            amount: data.amount,
            paymentMethod: data.payment_method,
            order_info: data.order_info,
        }),
};

export default paymentService;
