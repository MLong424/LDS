// src/services/interfaces/IPaymentService.ts

import { PaymentData } from "./IPaymentStrategy";

// Configuration interface for the payment gateway
export interface PaymentConfig {
    merchantId: string;
    secureKey: string;
    paymentUrl: string;
    returnUrl: string;
    apiUrl: string;
}

// Payment data interface
export interface ProviderData {
    locale?: string;
    currencyCode?: string;
    bankCode?: string;
    payDate?: string;
    responseCode: string;
}

// Payment result interface
export interface PaymentResult {
    success: boolean;
    orderId: string;
    amount?: number;
    orderInfo?: string;
    transactionId?: string;
    errorCode?: string;
    errorMessage?: string;
    providerData?: ProviderData;
}

// Interface for the payment gateway service
export interface IPaymentService {
    createPaymentUrl(paymentData: PaymentData ): string;
    verifyReturnParameters(params: Record<string, string>): Promise<PaymentResult>;
}