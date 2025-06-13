// src/models/entity/Order.ts
import { PaymentMethod, PaymentStatus, DeliveryType, OrderStatus } from './common';

// Base Order class using Template Method Pattern
export abstract class Order {
    order_id!: string;
    recipient_name!: string;
    recipient_email!: string;
    recipient_phone!: string;
    delivery_province!: string;
    delivery_address!: string;
    delivery_type!: DeliveryType;
    rush_delivery_time?: Date;
    rush_delivery_instructions?: string;
    products_total!: number; // Total price of products excluding VAT
    vat_amount!: number; // 10% VAT
    delivery_fee!: number;
    rush_delivery_fee!: number;
    total_amount!: number; // Total including products with VAT and all delivery fees
    order_status!: OrderStatus;
    payment_status!: PaymentStatus;
    created_at!: Date;
    rejected_reason?: string;

    /**
     * Template method for calculating order totals
     * This method defines the structure for order total calculations
     */
    public calculateTotals(): {
        products_total: number;
        vat_amount: number;
        delivery_fee: number;
        rush_delivery_fee: number;
        total_amount: number;
    } {
        const productsTotal = this.calculateProductsTotal();
        const vatAmount = this.calculateVATAmount(productsTotal);
        const deliveryFee = this.calculateDeliveryFee();
        const rushDeliveryFee = this.calculateRushDeliveryFee();
        const totalAmount = this.calculateFinalTotal(productsTotal, vatAmount, deliveryFee, rushDeliveryFee);

        return {
            products_total: productsTotal,
            vat_amount: vatAmount,
            delivery_fee: deliveryFee,
            rush_delivery_fee: rushDeliveryFee,
            total_amount: totalAmount
        };
    }

    /**
     * Template method for order validation
     * This method defines the structure for order validation
     */
    public validateOrder(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.validateBasicInfo()) {
            errors.push('Basic order information is incomplete');
        }

        if (!this.validateDeliveryInfo()) {
            errors.push('Delivery information is incomplete or invalid');
        }

        if (!this.validatePaymentInfo()) {
            errors.push('Payment information is invalid');
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
     * Template method for status transition validation
     */
    public canTransitionTo(newStatus: OrderStatus): { canTransition: boolean; reason?: string } {
        const currentStatus = this.getOrderStatus();
        
        if (!this.isValidStatusTransition(currentStatus, newStatus)) {
            return {
                canTransition: false,
                reason: `Cannot transition from ${currentStatus} to ${newStatus}`
            };
        }

        const customValidation = this.validateCustomStatusTransition(currentStatus, newStatus);
        if (!customValidation.canTransition) {
            return customValidation;
        }

        return { canTransition: true };
    }

    /**
     * Template method for generating order display information
     */
    public getOrderDisplayInfo(): string {
        const basicInfo = this.getBasicOrderInfo();
        const statusInfo = this.getStatusInfo();
        const totalInfo = this.getTotalInfo();
        
        return this.formatOrderDisplayInfo(basicInfo, statusInfo, totalInfo);
    }

    // Common methods that can be overridden by subclasses
    protected calculateProductsTotal(): number {
        return this.products_total;
    }

    protected calculateVATAmount(productsTotal: number): number {
        return productsTotal * 0.1; // Default 10% VAT
    }

    protected calculateDeliveryFee(): number {
        return this.delivery_fee;
    }

    protected calculateRushDeliveryFee(): number {
        return this.rush_delivery_fee;
    }

    protected calculateFinalTotal(
        productsTotal: number,
        vatAmount: number,
        deliveryFee: number,
        rushDeliveryFee: number
    ): number {
        return productsTotal + vatAmount + deliveryFee + rushDeliveryFee;
    }

    protected validateBasicInfo(): boolean {
        return !!(
            this.order_id &&
            this.recipient_name &&
            this.recipient_email &&
            this.recipient_phone
        );
    }

    protected validateDeliveryInfo(): boolean {
        return !!(
            this.delivery_province &&
            this.delivery_address &&
            this.delivery_type
        );
    }

    protected validatePaymentInfo(): boolean {
        return this.total_amount > 0;
    }

    protected isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            'PENDING_PROCESSING': ['APPROVED', 'REJECTED', 'CANCELED'],
            'APPROVED': ['SHIPPED', 'CANCELED'],
            'REJECTED': ['PENDING_PROCESSING'],
            'SHIPPED': ['DELIVERED'],
            'DELIVERED': [],
            'CANCELED': []
        };

        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    protected getBasicOrderInfo(): string {
        return `Order #${this.order_id} for ${this.recipient_name}`;
    }

    protected getStatusInfo(): string {
        return `Status: ${this.order_status}, Payment: ${this.payment_status}`;
    }

    protected getTotalInfo(): string {
        return `Total: ${this.total_amount.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}`;
    }

    protected formatOrderDisplayInfo(basicInfo: string, statusInfo: string, totalInfo: string): string {
        return `${basicInfo} | ${statusInfo} | ${totalInfo}`;
    }

    // Common utility methods
    public getOrderStatus(): OrderStatus {
        return this.order_status;
    }

    public getPaymentStatus(): PaymentStatus {
        return this.payment_status;
    }

    public isRushDelivery(): boolean {
        return this.delivery_type === 'RUSH';
    }

    public isPaid(): boolean {
        return this.payment_status === 'COMPLETED';
    }

    public canBeCanceled(): boolean {
        return ['PENDING_PROCESSING', 'APPROVED'].includes(this.order_status);
    }

    public getDeliveryAddress(): string {
        return `${this.delivery_address}, ${this.delivery_province}`;
    }

    // Abstract methods that subclasses must implement
    public abstract getOrderType(): string;
    protected abstract performCustomValidation(): { isValid: boolean; errors: string[] };
    protected abstract validateCustomStatusTransition(
        currentStatus: OrderStatus, 
        newStatus: OrderStatus
    ): { canTransition: boolean; reason?: string };

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
            products_total: this.products_total,
            vat_amount: this.vat_amount,
            delivery_fee: this.delivery_fee,
            rush_delivery_fee: this.rush_delivery_fee,
            total_amount: this.total_amount,
            order_status: this.order_status,
            payment_status: this.payment_status,
            created_at: this.created_at,
            rejected_reason: this.rejected_reason
        };
    }
}

// Standard Order implementation
export class StandardOrder extends Order {
    public getOrderType(): string {
        return 'STANDARD';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Standard orders have basic validation
        if (this.total_amount < 0) {
            errors.push('Order total cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected validateCustomStatusTransition(
        currentStatus: OrderStatus, 
        newStatus: OrderStatus
    ): { canTransition: boolean; reason?: string } {
        // Standard orders have no additional restrictions
        return { canTransition: true };
    }
}

// Rush Order implementation with additional validations
export class RushOrder extends Order {
    public getOrderType(): string {
        return 'RUSH';
    }

    protected calculateRushDeliveryFee(): number {
        // Rush orders have higher delivery fees
        return Math.max(this.rush_delivery_fee, this.delivery_fee * 0.5);
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (!this.isRushDelivery()) {
            errors.push('Rush order must have RUSH delivery type');
        }

        if (this.isRushDelivery() && !this.rush_delivery_time) {
            errors.push('Rush delivery requires specified delivery time');
        }

        if (this.rush_delivery_time && this.rush_delivery_time <= new Date()) {
            errors.push('Rush delivery time must be in the future');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected validateCustomStatusTransition(
        currentStatus: OrderStatus, 
        newStatus: OrderStatus
    ): { canTransition: boolean; reason?: string } {
        // Rush orders require payment before approval
        if (currentStatus === 'PENDING_PROCESSING' && newStatus === 'APPROVED' && !this.isPaid()) {
            return {
                canTransition: false,
                reason: 'Rush orders must be paid before approval'
            };
        }

        return { canTransition: true };
    }

    public getRushDeliveryTime(): Date | undefined {
        return this.rush_delivery_time;
    }

    public getRushInstructions(): string | undefined {
        return this.rush_delivery_instructions;
    }
}

// Order item class
export class OrderItem {
    order_id!: string;
    product_id!: number;
    quantity!: number;
    unit_price!: number; // Price at time of order
    is_rush_delivery!: boolean;

    /**
     * Calculate subtotal for this item
     */
    public calculateSubtotal(): number {
        return this.quantity * this.unit_price;
    }

    /**
     * Validate order item
     */
    public validateItem(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (this.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        }

        if (this.unit_price < 0) {
            errors.push('Unit price cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    public toJSON(): any {
        return {
            order_id: this.order_id,
            product_id: this.product_id,
            quantity: this.quantity,
            unit_price: this.unit_price,
            is_rush_delivery: this.is_rush_delivery
        };
    }
}

// Order status history class
export class OrderStatusHistory {
    id!: number;
    order_id!: string;
    old_status?: OrderStatus;
    new_status!: OrderStatus;
    changed_at!: Date;
    changed_by?: string; // User ID if available
    notes?: string;

    /**
     * Create status change record
     */
    public static createStatusChange(
        orderId: string,
        oldStatus: OrderStatus | undefined,
        newStatus: OrderStatus,
        changedBy?: string,
        notes?: string
    ): OrderStatusHistory {
        const history = new OrderStatusHistory();
        history.order_id = orderId;
        history.old_status = oldStatus;
        history.new_status = newStatus;
        history.changed_at = new Date();
        history.changed_by = changedBy;
        history.notes = notes;
        return history;
    }

    public getChangeDescription(): string {
        const from = this.old_status ? `from ${this.old_status}` : 'initial status';
        return `Changed ${from} to ${this.new_status}`;
    }

    public toJSON(): any {
        return {
            id: this.id,
            order_id: this.order_id,
            old_status: this.old_status,
            new_status: this.new_status,
            changed_at: this.changed_at,
            changed_by: this.changed_by,
            notes: this.notes
        };
    }
}

// Refund class
export class Refund {
    id!: string;
    payment_id!: string;
    amount!: number;
    status!: string;
    vnpay_refund_transaction_id?: string;
    refund_datetime!: Date;
    refund_reason?: string;

    /**
     * Validate refund request
     */
    public validateRefund(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (this.amount <= 0) {
            errors.push('Refund amount must be greater than 0');
        }

        if (!this.refund_reason || this.refund_reason.trim().length < 10) {
            errors.push('Refund reason must be at least 10 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    public isProcessed(): boolean {
        return this.status === 'COMPLETED';
    }

    public toJSON(): any {
        return {
            id: this.id,
            payment_id: this.payment_id,
            amount: this.amount,
            status: this.status,
            vnpay_refund_transaction_id: this.vnpay_refund_transaction_id,
            refund_datetime: this.refund_datetime,
            refund_reason: this.refund_reason
        };
    }
}

// Order detail with items, payments, and status history
export class OrderDetail extends Order {
    items!: OrderItem[];
    payment_info?: {
        payment_id: string;
        amount: number;
        payment_status: PaymentStatus;
        payment_method: PaymentMethod;
        vnpay_transaction_id?: string;
        vnpay_transaction_datetime?: Date;
        created_at: Date;
        refund?: Refund[];
    }[];
    status_history?: OrderStatusHistory[];

    public getOrderType(): string {
        return 'DETAILED';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (!this.items || this.items.length === 0) {
            errors.push('Order must have at least one item');
        }

        // Validate all items
        for (const item of this.items || []) {
            const itemValidation = item.validateItem();
            if (!itemValidation.isValid) {
                errors.push(...itemValidation.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    protected validateCustomStatusTransition(
        currentStatus: OrderStatus, 
        newStatus: OrderStatus
    ): { canTransition: boolean; reason?: string } {
        return { canTransition: true };
    }

    protected calculateProductsTotal(): number {
        if (!this.items) return 0;
        return this.items.reduce((total, item) => total + item.calculateSubtotal(), 0);
    }

    public getItemCount(): number {
        return this.items?.reduce((count, item) => count + item.quantity, 0) || 0;
    }

    public hasRushItems(): boolean {
        return this.items?.some(item => item.is_rush_delivery) || false;
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            items: this.items?.map(item => item.toJSON()),
            payment_info: this.payment_info,
            status_history: this.status_history?.map(history => history.toJSON())
        };
    }
}

// Legacy interface types for backward compatibility
export interface CreateOrderParams {
    session_id: string;
    recipient_name: string;
    recipient_email: string;
    recipient_phone: string;
    delivery_province: string;
    delivery_address: string;
    delivery_type: DeliveryType;
    rush_delivery_time?: Date;
    rush_delivery_instructions?: string;
}

export interface ApproveOrderParams {
    order_id: string;
    user_id: string;
}

export interface RejectOrderParams {
    order_id: string;
    user_id: string;
    reason: string;
}

export interface PendingOrder {
    order_id: string;
    recipient_name: string;
    recipient_email: string;
    recipient_phone: string;
    delivery_province: string;
    delivery_address: string;
    total_amount: number;
    payment_status: PaymentStatus;
    created_at: Date;
    has_sufficient_stock: boolean;
}