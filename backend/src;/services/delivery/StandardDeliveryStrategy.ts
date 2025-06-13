// src/services/delivery/StandardDeliveryStrategy.ts
import { IDeliveryStrategy, DeliveryParams, DeliveryFeeCalculation } from '../interfaces/IDeliveryStrategy';

export class StandardDeliveryStrategy implements IDeliveryStrategy {
    private readonly baseFee: number = 30000; // 30,000 VND base fee
    private readonly weightMultiplier: number = 5000; // 5,000 VND per kg
    private readonly freeShippingThreshold: number = 500000; // 500,000 VND

    getName(): string {
        return 'STANDARD';
    }

    calculateDeliveryFee(params: DeliveryParams): DeliveryFeeCalculation {
        const standardFee = this.calculateStandardFee(params);
        const rushFee = params.isRushDelivery ? this.calculateRushFee(params) : 0;
        const freeShippingApplied = this.isEligibleForFreeShipping(params.totalOrderValue);

        return {
            standardDeliveryFee: freeShippingApplied ? 0 : standardFee,
            rushDeliveryFee: rushFee,
            freeShippingApplied
        };
    }

    private calculateStandardFee(params: DeliveryParams): number {
        // Base fee + weight-based fee + province-based adjustment
        let fee = this.baseFee;
        fee += params.heaviestItemWeight * this.weightMultiplier;
        fee += this.getProvinceAdjustment(params.province);
        return Math.round(fee);
    }

    private calculateRushFee(params: DeliveryParams): number {
        // Rush delivery is 50% more than standard
        const standardFee = this.calculateStandardFee(params);
        return Math.round(standardFee * 0.5);
    }

    private getProvinceAdjustment(province: string): number {
        // Different provinces have different delivery costs
        const provinceAdjustments: Record<string, number> = {
            'Ho Chi Minh': 0,
            'Hanoi': 5000,
            'Da Nang': 10000,
            'Can Tho': 15000,
            'Hai Phong': 12000,
            'default': 20000
        };

        return provinceAdjustments[province] || provinceAdjustments['default'];
    }

    isEligibleForFreeShipping(totalOrderValue: number): boolean {
        return totalOrderValue >= this.freeShippingThreshold;
    }

    getMinimumOrderForFreeShipping(): number {
        return this.freeShippingThreshold;
    }
}