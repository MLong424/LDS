// src/services/interfaces/IDeliveryStrategy.ts
export interface DeliveryParams {
    province: string;
    address: string;
    totalOrderValue: number;
    heaviestItemWeight: number;
    isRushDelivery: boolean;
}

export interface DeliveryFeeCalculation {
    standardDeliveryFee: number;
    rushDeliveryFee: number;
    freeShippingApplied: boolean;
}

export interface IDeliveryStrategy {
    getName(): string;
    calculateDeliveryFee(params: DeliveryParams): DeliveryFeeCalculation;
    isEligibleForFreeShipping(totalOrderValue: number): boolean;
    getMinimumOrderForFreeShipping(): number;
}
