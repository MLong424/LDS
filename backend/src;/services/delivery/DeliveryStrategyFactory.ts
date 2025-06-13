// src/services/delivery/DeliveryStrategyFactory.ts
import { IDeliveryStrategy } from '../interfaces/IDeliveryStrategy';
import { StandardDeliveryStrategy } from './StandardDeliveryStrategy';
import { RushDeliveryStrategy } from './RushDeliveryStrategy';

export type DeliveryStrategyType = 'STANDARD' | 'RUSH' | 'EXPRESS' | 'OVERNIGHT' | 'INTERNATIONAL';

export interface DeliveryStrategyCreator {
    createStrategy(): IDeliveryStrategy;
    getConfigurationKeys(): string[];
    validateConfiguration(): boolean;
    isAvailableInRegion(region: string): boolean;
}

export class DeliveryStrategyFactory {
    private static strategyCreators: Map<DeliveryStrategyType, DeliveryStrategyCreator> = new Map();

    /**
     * Register a delivery strategy creator (Open for extension)
     */
    static registerStrategyCreator(type: DeliveryStrategyType, creator: DeliveryStrategyCreator): void {
        this.strategyCreators.set(type, creator);
    }

    /**
     * Create a delivery strategy (Closed for modification)
     */
    static createStrategy(type: DeliveryStrategyType): IDeliveryStrategy {
        const creator = this.strategyCreators.get(type);
        if (!creator) {
            throw new Error(`No creator registered for delivery strategy: ${type}`);
        }

        if (!creator.validateConfiguration()) {
            throw new Error(`Invalid configuration for delivery strategy: ${type}`);
        }

        return creator.createStrategy();
    }

    /**
     * Get all available delivery strategy types
     */
    static getAvailableStrategies(): DeliveryStrategyType[] {
        return Array.from(this.strategyCreators.keys());
    }

    /**
     * Get strategies available for a specific region
     */
    static getAvailableStrategiesForRegion(region: string): DeliveryStrategyType[] {
        const availableStrategies: DeliveryStrategyType[] = [];
        
        for (const [type, creator] of this.strategyCreators.entries()) {
            if (creator.isAvailableInRegion(region)) {
                availableStrategies.push(type);
            }
        }
        
        return availableStrategies;
    }

    /**
     * Check if a strategy type is supported
     */
    static isStrategySupported(type: string): type is DeliveryStrategyType {
        return this.strategyCreators.has(type as DeliveryStrategyType);
    }

    /**
     * Initialize default strategy creators
     */
    static initialize(): void {
        this.registerStrategyCreator('STANDARD', new StandardDeliveryCreator());
        this.registerStrategyCreator('RUSH', new RushDeliveryCreator());
        // Future strategies can be registered here without modifying existing code
        // this.registerStrategyCreator('EXPRESS', new ExpressDeliveryCreator());
        // this.registerStrategyCreator('OVERNIGHT', new OvernightDeliveryCreator());
        // this.registerStrategyCreator('INTERNATIONAL', new InternationalDeliveryCreator());
    }
}

// Standard Delivery Strategy Creator
class StandardDeliveryCreator implements DeliveryStrategyCreator {
    createStrategy(): IDeliveryStrategy {
        return new StandardDeliveryStrategy();
    }

    getConfigurationKeys(): string[] {
        return [
            'STANDARD_DELIVERY_BASE_FEE',
            'STANDARD_DELIVERY_WEIGHT_MULTIPLIER',
            'STANDARD_FREE_SHIPPING_THRESHOLD'
        ];
    }

    validateConfiguration(): boolean {
        // Standard delivery has default values, so it's always valid
        return true;
    }

    isAvailableInRegion(region: string): boolean {
        // Standard delivery is available everywhere
        return true;
    }
}

// Rush Delivery Strategy Creator
class RushDeliveryCreator implements DeliveryStrategyCreator {
    createStrategy(): IDeliveryStrategy {
        return new RushDeliveryStrategy();
    }

    getConfigurationKeys(): string[] {
        return [
            'RUSH_DELIVERY_BASE_FEE',
            'RUSH_DELIVERY_WEIGHT_MULTIPLIER',
            'RUSH_FREE_SHIPPING_THRESHOLD'
        ];
    }

    validateConfiguration(): boolean {
        // Rush delivery has default values, so it's always valid
        return true;
    }

    isAvailableInRegion(region: string): boolean {
        // Rush delivery might not be available in all regions
        const unavailableRegions = ['Remote Areas', 'International'];
        return !unavailableRegions.includes(region);
    }
}

// Example of how to add new delivery methods without modifying existing code
export class ExpressDeliveryCreator implements DeliveryStrategyCreator {
    createStrategy(): IDeliveryStrategy {
        // Implementation would go here
        throw new Error('Express delivery strategy not implemented yet');
    }

    getConfigurationKeys(): string[] {
        return [
            'EXPRESS_DELIVERY_BASE_FEE',
            'EXPRESS_DELIVERY_WEIGHT_MULTIPLIER',
            'EXPRESS_FREE_SHIPPING_THRESHOLD',
            'EXPRESS_CUTOFF_TIME'
        ];
    }

    validateConfiguration(): boolean {
        const requiredKeys = ['EXPRESS_DELIVERY_BASE_FEE'];
        return requiredKeys.every(key => process.env[key] && process.env[key]!.trim() !== '');
    }

    isAvailableInRegion(region: string): boolean {
        // Express delivery might only be available in major cities
        const availableRegions = ['Ho Chi Minh', 'Hanoi', 'Da Nang'];
        return availableRegions.includes(region);
    }
}

export class OvernightDeliveryCreator implements DeliveryStrategyCreator {
    createStrategy(): IDeliveryStrategy {
        // Implementation would go here
        throw new Error('Overnight delivery strategy not implemented yet');
    }

    getConfigurationKeys(): string[] {
        return [
            'OVERNIGHT_DELIVERY_BASE_FEE',
            'OVERNIGHT_DELIVERY_WEIGHT_MULTIPLIER',
            'OVERNIGHT_CUTOFF_TIME',
            'OVERNIGHT_PARTNER_API_KEY'
        ];
    }

    validateConfiguration(): boolean {
        const requiredKeys = ['OVERNIGHT_PARTNER_API_KEY'];
        return requiredKeys.every(key => process.env[key] && process.env[key]!.trim() !== '');
    }

    isAvailableInRegion(region: string): boolean {
        // Overnight delivery might only be available in select regions
        const availableRegions = ['Ho Chi Minh', 'Hanoi'];
        return availableRegions.includes(region);
    }
}

export class InternationalDeliveryCreator implements DeliveryStrategyCreator {
    createStrategy(): IDeliveryStrategy {
        // Implementation would go here
        throw new Error('International delivery strategy not implemented yet');
    }

    getConfigurationKeys(): string[] {
        return [
            'INTERNATIONAL_DELIVERY_BASE_FEE',
            'INTERNATIONAL_CUSTOMS_FEE',
            'INTERNATIONAL_PARTNER_API_KEY',
            'INTERNATIONAL_INSURANCE_RATE'
        ];
    }

    validateConfiguration(): boolean {
        const requiredKeys = ['INTERNATIONAL_PARTNER_API_KEY'];
        return requiredKeys.every(key => process.env[key] && process.env[key]!.trim() !== '');
    }

    isAvailableInRegion(region: string): boolean {
        // International delivery is available for export only
        return region === 'International';
    }
}