// src/services/interfaces/IPaymentStrategy.ts
import { PaymentResult } from './IPaymentService';

export interface PaymentData {
    orderId: string;
    amount: number;
    locale?: string;
    currencyCode?: string;
    orderInfo?: string;
    ipAddress?: string;
    additionalParams?: Record<string, any>;
}

export interface IPaymentStrategy {
    getName(): string;
    createPaymentUrl(paymentData: PaymentData): string;
    verifyReturnParameters(params: Record<string, string>): Promise<PaymentResult>;
}