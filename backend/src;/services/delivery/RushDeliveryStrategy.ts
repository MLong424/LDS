// src/services/delivery/RushDeliveryStrategy.ts
import { IDeliveryStrategy, DeliveryParams, DeliveryFeeCalculation } from '../interfaces/IDeliveryStrategy';
import { StandardDeliveryStrategy } from './StandardDeliveryStrategy';
export class RushDeliveryStrategy implements IDeliveryStrategy {
    private readonly baseFee: number = 50000; // 50,000 VND base fee for rush
    private readonly weightMultiplier: number = 8000; // 8,000 VND per kg
    private readonly freeShippingThreshold: number = 1000000; // 1,000,000 VND (higher threshold)

    getName(): string {
        return 'RUSH';
    }

    calculateDeliveryFee(params: DeliveryParams): DeliveryFeeCalculation {
        const standardFee = this.calculateStandardEquivalent(params);
        const rushFee = this.calculateRushFee(params);
        const freeShippingApplied = this.isEligibleForFreeShipping(params.totalOrderValue);

        return {
            standardDeliveryFee: freeShippingApplied ? 0 : standardFee,
            rushDeliveryFee: freeShippingApplied ? 0 : rushFee,
            freeShippingApplied
        };
    }

    private calculateStandardEquivalent(params: DeliveryParams): number {
        // Use standard strategy calculation for comparison
        const standardStrategy = new StandardDeliveryStrategy();
        return standardStrategy.calculateDeliveryFee(params).standardDeliveryFee;
    }

    private calculateRushFee(params: DeliveryParams): number {
        let fee = this.baseFee;
        fee += params.heaviestItemWeight * this.weightMultiplier;
        fee += this.getProvinceAdjustment(params.province);
        return Math.round(fee);
    }

    private getProvinceAdjustment(province: string): number {
        // Rush delivery has higher province adjustments
        const provinceAdjustments: Record<string, number> = {
            'Ho Chi Minh': 0,
            'Hanoi': 10000,
            'Da Nang': 20000,
            'Can Tho': 30000,
            'Hai Phong': 25000,
            'default': 40000
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