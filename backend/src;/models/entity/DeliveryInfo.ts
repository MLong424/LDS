// src/models/entity/DeliveryInfo.ts
import { DeliveryType } from './common';

// Base DeliveryInfo class using Template Method Pattern
export abstract class DeliveryInfo {
    order_id!: string;
    recipient_name!: string;
    recipient_email!: string;
    recipient_phone!: string;
    delivery_province!: string;
    delivery_address!: string;
    delivery_type!: DeliveryType;
    rush_delivery_time?: Date;
    rush_delivery_instructions?: string;
    standard_delivery_fee!: number;
    rush_delivery_fee!: number;

    /**
     * Template method for delivery validation
     * This method defines the structure for delivery validation
     */
    public validateDelivery(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.validateBasicInfo()) {
            errors.push('Basic delivery information is incomplete');
        }

        if (!this.validateRecipient()) {
            errors.push('Recipient information is invalid');
        }

        if (!this.validateAddress()) {
            errors.push('Delivery address is invalid');
        }

        if (!this.validateDeliveryType()) {
            errors.push('Delivery type configuration is invalid');
        }

        const customValidation = this.performCustomValidation();
        if (!customValidation.isValid) {
            errors.push(...customValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Template method for calculating total delivery cost
     */
    public calculateTotalDeliveryCost(): number {
        const baseFee = this.getBaseFee();
        const rushFee = this.isRushDelivery() ? this.getRushFee() : 0;
        const adjustments = this.getDeliveryAdjustments();
        
        return baseFee + rushFee + adjustments;
    }

    /**
     * Template method for delivery time estimation
     */
    public getEstimatedDeliveryTime(): string {
        const baseTime = this.getBaseDeliveryTime();
        const adjustments = this.getTimeAdjustments();
        
        return this.formatDeliveryTime(baseTime, adjustments);
    }

    /**
     * Template method for delivery feasibility check
     */
    public canDeliver(): { canDeliver: boolean; reason?: string } {
        if (!this.isDeliveryAreaSupported()) {
            return {
                canDeliver: false,
                reason: `Delivery not available to ${this.delivery_province}`
            };
        }

        if (this.isRushDelivery() && !this.isRushDeliveryAvailable()) {
            return {
                canDeliver: false,
                reason: 'Rush delivery not available for this location'
            };
        }

        const customCheck = this.performCustomDeliveryCheck();
        if (!customCheck.canDeliver) {
            return customCheck;
        }

        return { canDeliver: true };
    }

    // Common methods that can be overridden by subclasses
    protected validateBasicInfo(): boolean {
        return !!(
            this.order_id &&
            this.delivery_type &&
            this.delivery_province &&
            this.delivery_address
        );
    }

    protected validateRecipient(): boolean {
        return !!(
            this.recipient_name &&
            this.recipient_email &&
            this.recipient_phone
        );
    }

    protected validateAddress(): boolean {
        return this.delivery_address.length >= 10; // Minimum address length
    }

    protected validateDeliveryType(): boolean {
        if (this.delivery_type === 'RUSH') {
            return !!(this.rush_delivery_time && this.rush_delivery_time > new Date());
        }
        return true;
    }

    protected getBaseFee(): number {
        return this.standard_delivery_fee;
    }

    protected getRushFee(): number {
        return this.rush_delivery_fee;
    }

    protected getDeliveryAdjustments(): number {
        return 0; // Default no adjustments
    }

    protected getBaseDeliveryTime(): string {
        return this.isRushDelivery() ? '1-2 business days' : '3-5 business days';
    }

    protected getTimeAdjustments(): string {
        return '';
    }

    protected formatDeliveryTime(baseTime: string, adjustments: string): string {
        return adjustments ? `${baseTime} ${adjustments}` : baseTime;
    }

    protected isDeliveryAreaSupported(): boolean {
        // Override in subclasses for specific area support
        return true;
    }

    protected isRushDeliveryAvailable(): boolean {
        // Override in subclasses for rush delivery availability
        return true;
    }

    // Common utility methods
    public isRushDelivery(): boolean {
        return this.delivery_type === 'RUSH';
    }

    public getFullAddress(): string {
        return `${this.delivery_address}, ${this.delivery_province}`;
    }

    public getRecipientInfo(): string {
        return `${this.recipient_name} (${this.recipient_email}, ${this.recipient_phone})`;
    }

    public hasRushInstructions(): boolean {
        return !!(this.rush_delivery_instructions && this.rush_delivery_instructions.trim().length > 0);
    }

    // Abstract methods that subclasses must implement
    public abstract getDeliveryType(): string;
    protected abstract performCustomValidation(): { isValid: boolean; errors: string[] };
    protected abstract performCustomDeliveryCheck(): { canDeliver: boolean; reason?: string };

    // toJSON method to prevent circular references
    public toJSON(): any {
        return {
            order_id: this.order_id,
            recipient_name: this.recipient_name,
            recipient_email: this.recipient_email,
            recipient_phone: this.recipient_phone,
            delivery_province: this.delivery_province,
            delivery_address: this.delivery_address,
            delivery_type: this.delivery_type,
            rush_delivery_time: this.rush_delivery_time,
            rush_delivery_instructions: this.rush_delivery_instructions,
            standard_delivery_fee: this.standard_delivery_fee,
            rush_delivery_fee: this.rush_delivery_fee,
        };
    }
}

// Standard Delivery implementation
export class StandardDeliveryInfo extends DeliveryInfo {
    public getDeliveryType(): string {
        return 'STANDARD';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (this.delivery_type !== 'STANDARD') {
            errors.push('Delivery type must be STANDARD for standard delivery');
        }

        if (this.standard_delivery_fee < 0) {
            errors.push('Standard delivery fee cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected performCustomDeliveryCheck(): { canDeliver: boolean; reason?: string } {
        // Standard delivery is available everywhere
        return { canDeliver: true };
    }

    protected getBaseDeliveryTime(): string {
        return '3-5 business days';
    }
}

// Rush Delivery implementation
export class RushDeliveryInfo extends DeliveryInfo {
    public getDeliveryType(): string {
        return 'RUSH';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (this.delivery_type !== 'RUSH') {
            errors.push('Delivery type must be RUSH for rush delivery');
        }

        if (!this.rush_delivery_time) {
            errors.push('Rush delivery time is required');
        }

        if (this.rush_delivery_time && this.rush_delivery_time <= new Date()) {
            errors.push('Rush delivery time must be in the future');
        }

        if (this.rush_delivery_fee < 0) {
            errors.push('Rush delivery fee cannot be negative');
        }

        // Rush delivery should be within 48 hours
        if (this.rush_delivery_time) {
            const maxRushTime = new Date();
            maxRushTime.setHours(maxRushTime.getHours() + 48);
            
            if (this.rush_delivery_time > maxRushTime) {
                errors.push('Rush delivery must be within 48 hours');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected performCustomDeliveryCheck(): { canDeliver: boolean; reason?: string } {
        // Rush delivery might not be available in remote areas
        const restrictedProvinces = ['Remote Province', 'Mountain Area'];
        
        if (restrictedProvinces.includes(this.delivery_province)) {
            return {
                canDeliver: false,
                reason: 'Rush delivery not available in remote areas'
            };
        }

        return { canDeliver: true };
    }

    protected isRushDeliveryAvailable(): boolean {
        const restrictedProvinces = ['Remote Province', 'Mountain Area'];
        return !restrictedProvinces.includes(this.delivery_province);
    }

    protected getBaseDeliveryTime(): string {
        return '1-2 business days';
    }

    protected getTimeAdjustments(): string {
        if (this.rush_delivery_time) {
            const hours = Math.round((this.rush_delivery_time.getTime() - Date.now()) / (1000 * 60 * 60));
            if (hours <= 4) {
                return '(Express - within 4 hours)';
            } else if (hours <= 24) {
                return '(Same day delivery)';
            }
        }
        return '';
    }

    public getRushDeliveryTime(): Date | undefined {
        return this.rush_delivery_time;
    }

    public getRushInstructions(): string | undefined {
        return this.rush_delivery_instructions;
    }
}

// Delivery Fee Calculation Parameters class (Parameter Object Pattern)
export class DeliveryCalculationParams {
    session_id!: string;
    delivery_province!: string;
    delivery_address!: string;
    is_rush_delivery!: boolean;
    order_value?: number;
    total_weight?: number;

    constructor(params: {
        session_id: string;
        delivery_province: string;
        delivery_address: string;
        is_rush_delivery: boolean;
        order_value?: number;
        total_weight?: number;
    }) {
        this.session_id = params.session_id;
        this.delivery_province = params.delivery_province;
        this.delivery_address = params.delivery_address;
        this.is_rush_delivery = params.is_rush_delivery;
        this.order_value = params.order_value;
        this.total_weight = params.total_weight;
    }

    public validate(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.session_id) {
            errors.push('Session ID is required');
        }

        if (!this.delivery_province) {
            errors.push('Delivery province is required');
        }

        if (!this.delivery_address || this.delivery_address.length < 10) {
            errors.push('Valid delivery address is required (minimum 10 characters)');
        }

        if (this.order_value !== undefined && this.order_value < 0) {
            errors.push('Order value cannot be negative');
        }

        if (this.total_weight !== undefined && this.total_weight < 0) {
            errors.push('Total weight cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    public static fromRequest(req: any): DeliveryCalculationParams {
        return new DeliveryCalculationParams({
            session_id: req.body.session_id || req.cookies?.session_id,
            delivery_province: req.body.province,
            delivery_address: req.body.address,
            is_rush_delivery: req.body.is_rush_delivery === true,
            order_value: req.body.order_value,
            total_weight: req.body.total_weight
        });
    }
}

// Delivery Fee Result class
export class DeliveryFeeResult {
    standard_delivery_fee!: number;
    rush_delivery_fee!: number;
    free_shipping_applied!: boolean;
    total_order_value!: number;
    heaviest_item_weight!: number;

    constructor(data: {
        standard_delivery_fee: number;
        rush_delivery_fee: number;
        free_shipping_applied: boolean;
        total_order_value: number;
        heaviest_item_weight: number;
    }) {
        this.standard_delivery_fee = data.standard_delivery_fee;
        this.rush_delivery_fee = data.rush_delivery_fee;
        this.free_shipping_applied = data.free_shipping_applied;
        this.total_order_value = data.total_order_value;
        this.heaviest_item_weight = data.heaviest_item_weight;
    }

    public getTotalFee(isRushDelivery: boolean): number {
        if (this.free_shipping_applied) return 0;
        return isRushDelivery ? 
            this.standard_delivery_fee + this.rush_delivery_fee : 
            this.standard_delivery_fee;
    }

    public getSavings(): number {
        return this.free_shipping_applied ? this.standard_delivery_fee : 0;
    }

    public isEligibleForFreeShipping(): boolean {
        return this.free_shipping_applied;
    }

    public toJSON(): any {
        return {
            standard_delivery_fee: this.standard_delivery_fee,
            rush_delivery_fee: this.rush_delivery_fee,
            free_shipping_applied: this.free_shipping_applied,
            total_order_value: this.total_order_value,
            heaviest_item_weight: this.heaviest_item_weight
        };
    }
}

// Legacy interface types for backward compatibility
export interface CalculateDeliveryFeeParams {
    session_id: string;
    delivery_province: string;
    delivery_address: string;
    is_rush_delivery: boolean;
}