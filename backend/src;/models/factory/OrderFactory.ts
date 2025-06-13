// src/models/factory/OrderFactory.ts
import { StandardOrder, Order, RushOrder, OrderDetail, OrderItem } from '../entity/Order';
import { CreateOrderParams } from '../entity/Order';
import { DeliveryType } from '../entity/common';

// Enhanced Factory for creating different order types with validation
export class OrderFactory {
    private static creators: Map<string, OrderCreator> = new Map();
    private static validationRules: Map<string, OrderValidationRule[]> = new Map();

    /**
     * Register an order creator for an order type (Open for extension)
     */
    static registerCreator(orderType: string, creator: OrderCreator): void {
        this.creators.set(orderType.toUpperCase(), creator);
    }

    /**
     * Register validation rules for an order type (Open for extension)
     */
    static registerValidationRules(orderType: string, rules: OrderValidationRule[]): void {
        this.validationRules.set(orderType.toUpperCase(), rules);
    }

    /**
     * Create order using registered creator (Closed for modification)
     */
    static createOrder(orderType: string, data: any): Order {
        const creator = this.creators.get(orderType.toUpperCase());
        if (!creator) {
            throw new Error(`No creator registered for order type: ${orderType}`);
        }
        return creator.createOrder(data);
    }

    /**
     * Validate order data using registered rules (Closed for modification)
     */
    static validateOrderData(orderType: string, data: CreateOrderParams | any): { isValid: boolean; errors: string[] } {
        const rules = this.validationRules.get(orderType.toUpperCase()) || [];
        const errors: string[] = [];

        for (const rule of rules) {
            const result = rule.validate(data);
            if (!result.isValid) {
                errors.push(...result.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Get all supported order types
     */
    static getSupportedOrderTypes(): string[] {
        return Array.from(this.creators.keys());
    }

    /**
     * Check if order type is supported
     */
    static isOrderTypeSupported(orderType: string): boolean {
        return this.creators.has(orderType.toUpperCase());
    }

    /**
     * Initialize default creators and validation rules
     */
    static initialize(): void {
        // Register default creators
        this.registerCreator('STANDARD', new StandardOrderCreator());
        this.registerCreator('RUSH', new RushOrderCreator());

        // Register default validation rules
        this.registerValidationRules('STANDARD', [new CommonOrderValidationRule(), new StandardOrderValidationRule()]);
        this.registerValidationRules('RUSH', [new CommonOrderValidationRule(), new RushOrderValidationRule()]);
    }
}

// Abstract interfaces for extensibility
export interface OrderCreator {
    createOrder(data: any): Order;
}

export interface OrderValidationRule {
    validate(data: any): { isValid: boolean; errors: string[] };
}

// Standard Order Creator
class StandardOrderCreator implements OrderCreator {
    createOrder(data: any): StandardOrder {
        const order = new StandardOrder();
        this.setCommonProperties(order, data);
        return order;
    }

    private setCommonProperties(order: StandardOrder, data: any): void {
        order.order_id = data.order_id;
        order.recipient_name = data.recipient_name;
        order.recipient_email = data.recipient_email;
        order.recipient_phone = data.recipient_phone;
        order.delivery_province = data.delivery_province;
        order.delivery_address = data.delivery_address;
        order.delivery_type = data.delivery_type || 'STANDARD';
        order.products_total = data.products_total || 0;
        order.vat_amount = data.vat_amount || 0;
        order.delivery_fee = data.delivery_fee || 0;
        order.rush_delivery_fee = data.rush_delivery_fee || 0;
        order.total_amount = data.total_amount || 0;
        order.order_status = data.order_status || 'PENDING_PROCESSING';
        order.payment_status = data.payment_status || 'PENDING';
        order.created_at = data.created_at || new Date();
        order.rejected_reason = data.rejected_reason;
    }
}

// Rush Order Creator
class RushOrderCreator implements OrderCreator {
    createOrder(data: any): RushOrder {
        const order = new RushOrder();
        this.setCommonProperties(order, data);
        this.setRushSpecificProperties(order, data);
        return order;
    }

    private setCommonProperties(order: RushOrder, data: any): void {
        order.order_id = data.order_id;
        order.recipient_name = data.recipient_name;
        order.recipient_email = data.recipient_email;
        order.recipient_phone = data.recipient_phone;
        order.delivery_province = data.delivery_province;
        order.delivery_address = data.delivery_address;
        order.delivery_type = data.delivery_type || 'RUSH';
        order.products_total = data.products_total || 0;
        order.vat_amount = data.vat_amount || 0;
        order.delivery_fee = data.delivery_fee || 0;
        order.rush_delivery_fee = data.rush_delivery_fee || 0;
        order.total_amount = data.total_amount || 0;
        order.order_status = data.order_status || 'PENDING_PROCESSING';
        order.payment_status = data.payment_status || 'PENDING';
        order.created_at = data.created_at || new Date();
        order.rejected_reason = data.rejected_reason;
    }

    private setRushSpecificProperties(order: RushOrder, data: any): void {
        order.rush_delivery_time = data.rush_delivery_time;
        order.rush_delivery_instructions = data.rush_delivery_instructions;
    }
}

// Common Order Validation Rule
class CommonOrderValidationRule implements OrderValidationRule {
    validate(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.recipient_name?.trim()) {
            errors.push('Recipient name is required');
        }

        if (!data.recipient_email?.trim()) {
            errors.push('Recipient email is required');
        }

        if (data.recipient_email && !this.isValidEmail(data.recipient_email)) {
            errors.push('Recipient email format is invalid');
        }

        if (!data.recipient_phone?.trim()) {
            errors.push('Recipient phone is required');
        }

        if (!data.delivery_province?.trim()) {
            errors.push('Delivery province is required');
        }

        if (!data.delivery_address?.trim()) {
            errors.push('Delivery address is required');
        }

        if (data.delivery_address && data.delivery_address.trim().length < 10) {
            errors.push('Delivery address must be at least 10 characters long');
        }

        if (!data.delivery_type || !['STANDARD', 'RUSH'].includes(data.delivery_type)) {
            errors.push('Valid delivery type is required (STANDARD or RUSH)');
        }

        if (data.total_amount !== undefined && data.total_amount < 0) {
            errors.push('Total amount cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Standard Order Validation Rule
class StandardOrderValidationRule implements OrderValidationRule {
    validate(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (data.delivery_type && data.delivery_type !== 'STANDARD') {
            errors.push('Standard orders must have STANDARD delivery type');
        }

        if (data.rush_delivery_time) {
            errors.push('Standard orders should not have rush delivery time');
        }

        if (data.rush_delivery_instructions) {
            errors.push('Standard orders should not have rush delivery instructions');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

// Rush Order Validation Rule
class RushOrderValidationRule implements OrderValidationRule {
    validate(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (data.delivery_type && data.delivery_type !== 'RUSH') {
            errors.push('Rush orders must have RUSH delivery type');
        }

        if (!data.rush_delivery_time) {
            errors.push('Rush delivery time is required for rush orders');
        }

        if (data.rush_delivery_time) {
            const rushTime = new Date(data.rush_delivery_time);
            const now = new Date();
            
            if (rushTime <= now) {
                errors.push('Rush delivery time must be in the future');
            }

            // Rush delivery should be within 48 hours
            const maxRushTime = new Date();
            maxRushTime.setHours(maxRushTime.getHours() + 48);
            
            if (rushTime > maxRushTime) {
                errors.push('Rush delivery must be within 48 hours');
            }
        }

        if (data.rush_delivery_fee !== undefined && data.rush_delivery_fee < 0) {
            errors.push('Rush delivery fee cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

// Example of how to add new order types without modifying existing code
export class ExpressOrderCreator implements OrderCreator {
    createOrder(data: any): Order {
        // This would create a new ExpressOrder class that extends Order
        // For now, we'll create a Rush order with express characteristics
        const order = new RushOrder();
        // Set properties similar to RushOrderCreator but with express-specific rules
        return order;
    }
}

export class ExpressOrderValidationRule implements OrderValidationRule {
    validate(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (data.delivery_type && data.delivery_type !== 'EXPRESS') {
            errors.push('Express orders must have EXPRESS delivery type');
        }

        // Express orders need even tighter time constraints
        if (data.rush_delivery_time) {
            const rushTime = new Date(data.rush_delivery_time);
            const now = new Date();
            
            const maxExpressTime = new Date();
            maxExpressTime.setHours(maxExpressTime.getHours() + 4); // Only 4 hours for express
            
            if (rushTime > maxExpressTime) {
                errors.push('Express delivery must be within 4 hours');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

// Utility methods for order creation
export class OrderFactoryUtils {
    /**
     * Determine order type from delivery type
     */
    static determineOrderType(deliveryType: DeliveryType): string {
        switch (deliveryType) {
            case 'RUSH':
                return 'RUSH';
            case 'STANDARD':
            default:
                return 'STANDARD';
        }
    }

    /**
     * Create order with automatic type detection
     */
    static createOrderFromDeliveryType(data: any): Order {
        const deliveryType = data.delivery_type || 'STANDARD';
        const orderType = this.determineOrderType(deliveryType);
        return OrderFactory.createOrder(orderType, data);
    }

    /**
     * Validate order data with automatic type detection
     */
    static validateOrderDataFromDeliveryType(data: any): { isValid: boolean; errors: string[] } {
        const deliveryType = data.delivery_type || 'STANDARD';
        const orderType = this.determineOrderType(deliveryType);
        return OrderFactory.validateOrderData(orderType, data);
    }

    /**
     * Create OrderDetail from database result
     */
    static createOrderDetailFromData(orderData: any): OrderDetail {
        const orderType = this.determineOrderType(orderData.delivery_type);
        const order = OrderFactory.createOrder(orderType, orderData) as OrderDetail;
        
        // Set additional OrderDetail properties
        order.items = this.createOrderItems(orderData.items || []);
        order.payment_info = orderData.payment_info || [];
        order.status_history = orderData.status_history || [];
        
        return order;
    }

    /**
     * Create OrderItem array from database data
     */
    private static createOrderItems(itemsData: any[]): OrderItem[] {
        return itemsData.map((itemData: any) => {
            const item = new OrderItem();
            item.order_id = itemData.order_id;
            item.product_id = itemData.product_id;
            item.quantity = itemData.quantity;
            item.unit_price = itemData.unit_price;
            item.is_rush_delivery = itemData.is_rush_delivery || false;
            return item;
        });
    }

    /**
     * Get validation summary for multiple orders
     */
    static validateMultipleOrders(ordersData: any[]): { 
        validOrders: any[]; 
        invalidOrders: Array<{ data: any; errors: string[] }>; 
        summary: { total: number; valid: number; invalid: number } 
    } {
        const validOrders: any[] = [];
        const invalidOrders: Array<{ data: any; errors: string[] }> = [];

        for (const orderData of ordersData) {
            const validation = this.validateOrderDataFromDeliveryType(orderData);
            if (validation.isValid) {
                validOrders.push(orderData);
            } else {
                invalidOrders.push({ data: orderData, errors: validation.errors });
            }
        }

        return {
            validOrders,
            invalidOrders,
            summary: {
                total: ordersData.length,
                valid: validOrders.length,
                invalid: invalidOrders.length
            }
        };
    }

    /**
     * Create order with enhanced error handling
     */
    static createOrderSafely(orderType: string, data: any): { order?: Order; errors: string[] } {
        try {
            // First validate the data
            const validation = OrderFactory.validateOrderData(orderType, data);
            if (!validation.isValid) {
                return { errors: validation.errors };
            }

            // Create the order
            const order = OrderFactory.createOrder(orderType, data);
            
            // Validate the created order using Template Method Pattern
            const orderValidation = order.validateOrder();
            if (!orderValidation.isValid) {
                return { errors: [`Order creation succeeded but validation failed: ${orderValidation.errors.join(', ')}`] };
            }

            return { order, errors: [] };
        } catch (error) {
            return { errors: [error instanceof Error ? error.message : 'Unknown error during order creation'] };
        }
    }
}