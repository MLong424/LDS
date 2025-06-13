import { AxiosInstance, AxiosResponse } from 'axios';
import { PaymentDto, PaymentUrlRequest } from '@cusTypes/payments';
import { ApiResponse } from '@cusTypes/common';
import { IPaymentService } from '../interfaces/IApiService';

export default class PaymentServiceImpl implements IPaymentService {
    constructor(private apiClient: AxiosInstance) {}

    // New standardized interface methods
    processPayment(paymentData: PaymentDto): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.post<ApiResponse>('/payment/process', paymentData);
    }

    getPaymentMethods(): Promise<AxiosResponse<{
        success: boolean;
        methods: Array<{
            name: string;
            configured: boolean;
        }>;
    }>> {
        return this.apiClient.get<{
            success: boolean;
            methods: Array<{
                name: string;
                configured: boolean;
            }>;
        }>('/payment/methods');
    }

    getPaymentStatus(paymentId: string): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.get<ApiResponse>(`/payment/${paymentId}/status`);
    }

    // Legacy service methods for backward compatibility
    createPaymentUrl(data: PaymentUrlRequest): Promise<AxiosResponse<{
        success: boolean;
        paymentUrl: string;
        selectedMethod: string;
    }>> {
        return this.apiClient.post<{
            success: boolean;
            paymentUrl: string;
            selectedMethod: string;
        }>('/payment/create', {
            orderId: data.order_id,
            amount: data.amount,
            paymentMethod: data.payment_method,
            order_info: data.order_info,
        });
    }

    // Get configuration requirements for payment method
    getPaymentMethodConfig(method: string): Promise<AxiosResponse<{
        success: boolean;
        method: string;
        configRequirements: string[];
        isConfigured: boolean;
    }>> {
        return this.apiClient.get<{
            success: boolean;
            method: string;
            configRequirements: string[];
            isConfigured: boolean;
        }>(`/payment/methods/${method}/config`);
    }

    // Check status of all payment methods
    checkPaymentMethodStatus(): Promise<AxiosResponse<{
        success: boolean;
        status: Record<string, { available: boolean; configured: boolean }>;
    }>> {
        return this.apiClient.get<{
            success: boolean;
            status: Record<string, { available: boolean; configured: boolean }>;
        }>('/payment/methods/status');
    }
}