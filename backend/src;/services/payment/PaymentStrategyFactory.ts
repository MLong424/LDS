// src/services/payment/PaymentStrategyFactory.ts
import { IPaymentStrategy } from '../interfaces/IPaymentStrategy';
import { VNPayStrategy, VNPayConfig } from './VNPayStrategy';

export type PaymentStrategyType = 'VNPAY' | 'PAYPAL' | 'STRIPE' | 'BANK_TRANSFER';

export interface PaymentStrategyCreator {
    createStrategy(): IPaymentStrategy;
    getConfigurationKeys(): string[];
    validateConfiguration(): boolean;
}

export class PaymentStrategyFactory {
    private static strategyCreators: Map<PaymentStrategyType, PaymentStrategyCreator> = new Map();

    /**
     * Register a payment strategy creator (Open for extension)
     */
    static registerStrategyCreator(type: PaymentStrategyType, creator: PaymentStrategyCreator): void {
        this.strategyCreators.set(type, creator);
    }

    /**
     * Create a payment strategy (Closed for modification)
     */
    static createStrategy(type: PaymentStrategyType): IPaymentStrategy {
        const creator = this.strategyCreators.get(type);
        if (!creator) {
            throw new Error(`No creator registered for payment strategy: ${type}`);
        }

        if (!creator.validateConfiguration()) {
            throw new Error(`Invalid configuration for payment strategy: ${type}`);
        }

        return creator.createStrategy();
    }

    /**
     * Get all available payment strategy types
     */
    static getAvailableStrategies(): PaymentStrategyType[] {
        return Array.from(this.strategyCreators.keys());
    }

    /**
     * Check if a strategy type is supported
     */
    static isStrategySupported(type: string): type is PaymentStrategyType {
        return this.strategyCreators.has(type as PaymentStrategyType);
    }

    /**
     * Get configuration requirements for a strategy
     */
    static getConfigurationRequirements(type: PaymentStrategyType): string[] {
        const creator = this.strategyCreators.get(type);
        return creator ? creator.getConfigurationKeys() : [];
    }

    /**
     * Initialize default strategy creators
     */
    static initialize(): void {
        this.registerStrategyCreator('VNPAY', new VNPayStrategyCreator());
        // Future strategies can be registered here without modifying existing code
        // this.registerStrategyCreator('PAYPAL', new PayPalStrategyCreator());
        // this.registerStrategyCreator('STRIPE', new StripeStrategyCreator());
    }
}

// VNPay Strategy Creator
class VNPayStrategyCreator implements PaymentStrategyCreator {
    createStrategy(): IPaymentStrategy {
        const config: VNPayConfig = {
            merchantId: process.env.VNPAY_MERCHANT_ID || '',
            secureKey: process.env.VNPAY_SECURITY_KEY || '',
            paymentUrl: process.env.VNPAY_SANDBOX_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
            returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/payments/vnpay-return',
            apiUrl: process.env.VNPAY_API || 'https://sandbox.vnpayment.vn/merchant_webapi/transaction',
        };

        return new VNPayStrategy(config);
    }

    getConfigurationKeys(): string[] {
        return [
            'VNPAY_MERCHANT_ID',
            'VNPAY_SECURITY_KEY',
            'VNPAY_SANDBOX_URL',
            'VNPAY_RETURN_URL',
            'VNPAY_API'
        ];
    }

    validateConfiguration(): boolean {
        const requiredKeys = ['VNPAY_MERCHANT_ID', 'VNPAY_SECURITY_KEY'];
        return requiredKeys.every(key => process.env[key] && process.env[key]!.trim() !== '');
    }
}

// Example of how to add new payment methods without modifying existing code
export class PayPalStrategyCreator implements PaymentStrategyCreator {
    createStrategy(): IPaymentStrategy {
        // Implementation would go here
        throw new Error('PayPal strategy not implemented yet');
    }

    getConfigurationKeys(): string[] {
        return [
            'PAYPAL_CLIENT_ID',
            'PAYPAL_CLIENT_SECRET',
            'PAYPAL_API_URL',
            'PAYPAL_RETURN_URL'
        ];
    }

    validateConfiguration(): boolean {
        const requiredKeys = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'];
        return requiredKeys.every(key => process.env[key] && process.env[key]!.trim() !== '');
    }
}

export class StripeStrategyCreator implements PaymentStrategyCreator {
    createStrategy(): IPaymentStrategy {
        // Implementation would go here
        throw new Error('Stripe strategy not implemented yet');
    }

    getConfigurationKeys(): string[] {
        return [
            'STRIPE_PUBLIC_KEY',
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'STRIPE_RETURN_URL'
        ];
    }

    validateConfiguration(): boolean {
        const requiredKeys = ['STRIPE_SECRET_KEY'];
        return requiredKeys.every(key => process.env[key] && process.env[key]!.trim() !== '');
    }
}