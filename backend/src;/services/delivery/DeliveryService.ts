// src/services/DeliveryService.ts
import { IDeliveryStrategy, DeliveryParams, DeliveryFeeCalculation } from '../interfaces/IDeliveryStrategy';
import { DeliveryStrategyFactory, DeliveryStrategyType } from './DeliveryStrategyFactory';

export interface IDeliveryService {
    calculateDeliveryFee(params: DeliveryParams, strategyType?: DeliveryStrategyType): DeliveryFeeCalculation;
    getAvailableStrategies(): DeliveryStrategyType[];
    getAvailableStrategiesForRegion(region: string): DeliveryStrategyType[];
    setDefaultStrategy(strategyType: DeliveryStrategyType): void;
    isStrategyAvailableInRegion(strategyType: DeliveryStrategyType, region: string): boolean;
}

export class DeliveryService implements IDeliveryService {
    private defaultStrategy: DeliveryStrategyType = 'STANDARD';
    private strategies: Map<DeliveryStrategyType, IDeliveryStrategy> = new Map();

    constructor() {
        this.initializeStrategies();
    }

    /**
     * Initialize available strategies using factory (Open for extension)
     */
    private initializeStrategies(): void {
        const availableStrategies = DeliveryStrategyFactory.getAvailableStrategies();
        
        for (const strategyType of availableStrategies) {
            try {
                const strategy = DeliveryStrategyFactory.createStrategy(strategyType);
                this.strategies.set(strategyType, strategy);
            } catch (error) {
                console.warn(`Failed to initialize ${strategyType} delivery strategy:`, error);
            }
        }
    }

    /**
     * Calculate delivery fee using specified strategy (Closed for modification)
     */
    calculateDeliveryFee(params: DeliveryParams, strategyType?: DeliveryStrategyType): DeliveryFeeCalculation {
        const strategy = this.getStrategy(strategyType);
        return strategy.calculateDeliveryFee(params);
    }

    /**
     * Get all available delivery strategies (Closed for modification)
     */
    getAvailableStrategies(): DeliveryStrategyType[] {
        return Array.from(this.strategies.keys());
    }

    /**
     * Get strategies available for a specific region (Closed for modification)
     */
    getAvailableStrategiesForRegion(region: string): DeliveryStrategyType[] {
        return DeliveryStrategyFactory.getAvailableStrategiesForRegion(region);
    }

    /**
     * Set the default delivery strategy (Closed for modification)
     */
    setDefaultStrategy(strategyType: DeliveryStrategyType): void {
        if (!this.strategies.has(strategyType)) {
            throw new Error(`Delivery strategy '${strategyType}' is not available`);
        }
        this.defaultStrategy = strategyType;
    }

    /**
     * Get the current default strategy type
     */
    getDefaultStrategy(): DeliveryStrategyType {
        return this.defaultStrategy;
    }

    /**
     * Check if strategy is available in a specific region
     */
    isStrategyAvailableInRegion(strategyType: DeliveryStrategyType, region: string): boolean {
        const availableStrategies = this.getAvailableStrategiesForRegion(region);
        return availableStrategies.includes(strategyType);
    }

    /**
     * Check if free shipping is available for given order value (Closed for modification)
     */
    isEligibleForFreeShipping(totalOrderValue: number, strategyType?: DeliveryStrategyType): boolean {
        const strategy = this.getStrategy(strategyType);
        return strategy.isEligibleForFreeShipping(totalOrderValue);
    }

    /**
     * Get minimum order value for free shipping (Closed for modification)
     */
    getMinimumOrderForFreeShipping(strategyType?: DeliveryStrategyType): number {
        const strategy = this.getStrategy(strategyType);
        return strategy.getMinimumOrderForFreeShipping();
    }

    /**
     * Get estimated delivery time for a strategy (new functionality without modifying existing code)
     */
    getEstimatedDeliveryTime(strategyType?: DeliveryStrategyType, region?: string): string {
        const type = strategyType || this.defaultStrategy;
        
        // This could be extended to check region-specific delivery times
        const deliveryTimes: Record<DeliveryStrategyType, string> = {
            'STANDARD': '3-5 business days',
            'RUSH': '1-2 business days',
            'EXPRESS': '4-6 hours',
            'OVERNIGHT': 'Next business day',
            'INTERNATIONAL': '7-14 business days'
        };

        return deliveryTimes[type] || 'Time varies';
    }

    /**
     * Get delivery strategy details for display
     */
    getStrategyDetails(strategyType?: DeliveryStrategyType): {
        name: string;
        estimatedTime: string;
        minimumForFreeShipping: number;
        available: boolean;
    } {
        const type = strategyType || this.defaultStrategy;
        const strategy = this.strategies.get(type);
        
        return {
            name: strategy?.getName() || type,
            estimatedTime: this.getEstimatedDeliveryTime(type),
            minimumForFreeShipping: strategy?.getMinimumOrderForFreeShipping() || 0,
            available: !!strategy
        };
    }

    /**
     * Compare delivery options for a given order
     */
    compareDeliveryOptions(params: DeliveryParams): Array<{
        strategy: DeliveryStrategyType;
        calculation: DeliveryFeeCalculation;
        estimatedTime: string;
        available: boolean;
    }> {
        const availableStrategies = this.getAvailableStrategiesForRegion(params.province);
        
        return availableStrategies.map(strategyType => {
            try {
                const calculation = this.calculateDeliveryFee(params, strategyType);
                return {
                    strategy: strategyType,
                    calculation,
                    estimatedTime: this.getEstimatedDeliveryTime(strategyType, params.province),
                    available: true
                };
            } catch (error) {
                return {
                    strategy: strategyType,
                    calculation: {
                        standardDeliveryFee: 0,
                        rushDeliveryFee: 0,
                        freeShippingApplied: false
                    },
                    estimatedTime: 'Not available',
                    available: false
                };
            }
        });
    }

    /**
     * Get strategy instance (Closed for modification)
     */
    private getStrategy(strategyType?: DeliveryStrategyType): IDeliveryStrategy {
        const type = strategyType || this.defaultStrategy;
        const strategy = this.strategies.get(type);
        
        if (!strategy) {
            throw new Error(`Delivery strategy '${type}' is not available`);
        }
        
        return strategy;
    }

    /**
     * Refresh strategies (useful for dynamic configuration updates)
     */
    refreshStrategies(): void {
        this.strategies.clear();
        this.initializeStrategies();
    }

    /**
     * Register a custom strategy at runtime (Open for extension)
     */
    registerCustomStrategy(strategyType: DeliveryStrategyType, strategy: IDeliveryStrategy): void {
        this.strategies.set(strategyType, strategy);
    }
}