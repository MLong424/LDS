// src/services/interfaces/IDeliveryService.ts
import { DeliveryParams, DeliveryFeeCalculation } from './IDeliveryStrategy';
import { DeliveryStrategyType } from '../delivery/DeliveryStrategyFactory';

export interface IDeliveryService {
    calculateDeliveryFee(params: DeliveryParams, strategyType?: DeliveryStrategyType): DeliveryFeeCalculation;
    getAvailableStrategies(): DeliveryStrategyType[];
    getAvailableStrategiesForRegion(region: string): DeliveryStrategyType[];
    setDefaultStrategy(strategyType: DeliveryStrategyType): void;
    isStrategyAvailableInRegion(strategyType: DeliveryStrategyType, region: string): boolean;
    isEligibleForFreeShipping(totalOrderValue: number, strategyType?: DeliveryStrategyType): boolean;
    getMinimumOrderForFreeShipping(strategyType?: DeliveryStrategyType): number;
    getEstimatedDeliveryTime(strategyType?: DeliveryStrategyType, region?: string): string;
    getStrategyDetails(strategyType?: DeliveryStrategyType): {
        name: string;
        estimatedTime: string;
        minimumForFreeShipping: number;
        available: boolean;
    };
    compareDeliveryOptions(params: DeliveryParams): Array<{
        strategy: DeliveryStrategyType;
        calculation: DeliveryFeeCalculation;
        estimatedTime: string;
        available: boolean;
    }>;
}