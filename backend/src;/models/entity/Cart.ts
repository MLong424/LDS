// src/models/entity/Cart.ts
import { Product } from './Product';

// Base Cart Item class using Template Method Pattern
export abstract class CartItem {
    product_id!: number;
    quantity!: number;
    product?: Product; // Optional product details when joined

    /**
     * Template method for item validation
     * This method defines the structure for cart item validation
     */
    public validateItem(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.validateBasicInfo()) {
            errors.push('Basic item information is incomplete');
        }

        if (!this.validateQuantity()) {
            errors.push('Invalid quantity specified');
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
     * Template method for calculating item total
     * This method defines the structure for price calculations
     */
    public calculateTotal(): number {
        const unitPrice = this.getUnitPrice();
        const quantity = this.getQuantity();
        const discount = this.getItemDiscount();
        
        return this.calculateFinalPrice(unitPrice, quantity, discount);
    }

    /**
     * Template method for stock validation
     * This method defines the structure for stock checking
     */
    public validateStock(): { isValid: boolean; message: string; stockStatus: 'INSUFFICIENT' | 'LOW' | 'AVAILABLE' } {
        const availableStock = this.getAvailableStock();
        const requestedQuantity = this.getQuantity();
        
        if (availableStock < requestedQuantity) {
            return {
                isValid: false,
                message: `Insufficient stock. Available: ${availableStock}, Requested: ${requestedQuantity}`,
                stockStatus: 'INSUFFICIENT'
            };
        }

        const stockThreshold = this.getStockThreshold();
        if (availableStock <= stockThreshold) {
            return {
                isValid: true,
                message: `Low stock warning. Available: ${availableStock}`,
                stockStatus: 'LOW'
            };
        }

        return {
            isValid: true,
            message: 'Stock available',
            stockStatus: 'AVAILABLE'
        };
    }

    // Common methods that can be overridden by subclasses
    protected validateBasicInfo(): boolean {
        return !!(this.product_id && this.quantity);
    }

    protected validateQuantity(): boolean {
        return this.quantity > 0 && Number.isInteger(this.quantity);
    }

    protected getUnitPrice(): number {
        return this.product?.current_price || 0;
    }

    protected getQuantity(): number {
        return this.quantity;
    }

    protected getItemDiscount(): number {
        return 0; // Default no discount
    }

    protected calculateFinalPrice(unitPrice: number, quantity: number, discount: number): number {
        return (unitPrice * quantity) - discount;
    }

    protected getAvailableStock(): number {
        return this.product?.stock || 0;
    }

    protected getStockThreshold(): number {
        return 5; // Default low stock threshold
    }

    // Common utility methods
    public getProductId(): number {
        return this.product_id;
    }

    public updateQuantity(newQuantity: number): void {
        if (newQuantity > 0 && Number.isInteger(newQuantity)) {
            this.quantity = newQuantity;
        }
    }

    public hasProduct(): boolean {
        return !!this.product;
    }

    public getProductTitle(): string {
        return this.product?.title || 'Unknown Product';
    }

    // Abstract methods that subclasses must implement
    public abstract getItemType(): string;
    protected abstract performCustomValidation(): { isValid: boolean; errors: string[] };

    // toJSON method to prevent circular references
    public toJSON(): any {
        return {
            product_id: this.product_id,
            quantity: this.quantity,
            product: this.product ? {
                id: this.product.id,
                title: this.product.title,
                current_price: this.product.current_price,
                stock: this.product.stock,
                media_type: this.product.media_type
            } : undefined
        };
    }
}

// Standard Cart Item implementation
export class StandardCartItem extends CartItem {
    public getItemType(): string {
        return 'STANDARD';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (this.quantity > 99) {
            errors.push('Maximum quantity per item is 99');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Base Cart class using Template Method Pattern
export abstract class Cart {
    session_id!: string;
    items!: CartItem[];
    created_at!: Date;

    /**
     * Template method for cart validation
     * This method defines the structure for cart validation
     */
    public validateCart(): { isValid: boolean; errors: string[]; invalidItems?: any[] } {
        const errors: string[] = [];
        const invalidItems: any[] = [];

        if (!this.validateBasicInfo()) {
            errors.push('Cart basic information is incomplete');
        }

        if (!this.validateItems()) {
            errors.push('Cart contains invalid items');
        }

        // Validate each item
        for (const item of this.items) {
            const itemValidation = item.validateItem();
            if (!itemValidation.isValid) {
                invalidItems.push({
                    product_id: item.product_id,
                    errors: itemValidation.errors
                });
            }

            const stockValidation = item.validateStock();
            if (!stockValidation.isValid) {
                invalidItems.push({
                    product_id: item.product_id,
                    stock_issue: stockValidation.message
                });
            }
        }

        const customValidation = this.performCustomValidation();
        if (!customValidation.isValid) {
            errors.push(...customValidation.errors);
        }

        return {
            isValid: errors.length === 0 && invalidItems.length === 0,
            errors,
            invalidItems: invalidItems.length > 0 ? invalidItems : undefined
        };
    }

    /**
     * Template method for calculating cart totals
     * This method defines the structure for cart total calculations
     */
    public calculateTotals(): {
        subtotal: number;
        vat_amount: number;
        total_including_vat: number;
        item_count: number;
    } {
        const subtotal = this.calculateSubtotal();
        const vatAmount = this.calculateVAT(subtotal);
        const totalIncludingVat = subtotal + vatAmount;
        const itemCount = this.calculateItemCount();

        return {
            subtotal,
            vat_amount: vatAmount,
            total_including_vat: totalIncludingVat,
            item_count: itemCount,
        };
    }

    /**
     * Template method for cart optimization
     * This method defines the structure for cart optimization suggestions
     */
    public getOptimizationSuggestions(): {
        freeShippingThreshold?: number;
        bulkDiscountOpportunities: any[];
        recommendedItems: any[];
    } {
        const freeShippingThreshold = this.getFreeShippingThreshold();
        const bulkDiscounts = this.getBulkDiscountOpportunities();
        const recommendations = this.getRecommendedItems();

        return {
            freeShippingThreshold,
            bulkDiscountOpportunities: bulkDiscounts,
            recommendedItems: recommendations
        };
    }

    // Common methods that can be overridden by subclasses
    protected validateBasicInfo(): boolean {
        return !!(this.session_id && Array.isArray(this.items));
    }

    protected validateItems(): boolean {
        return this.items.length > 0;
    }

    protected calculateSubtotal(): number {
        return this.items.reduce((total, item) => total + item.calculateTotal(), 0);
    }

    protected calculateVAT(subtotal: number): number {
        return subtotal * 0.1; // Default 10% VAT
    }

    protected calculateItemCount(): number {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    protected getFreeShippingThreshold(): number | undefined {
        const currentTotal = this.calculateSubtotal();
        const freeShippingMinimum = 500000; // 500,000 VND
        
        if (currentTotal < freeShippingMinimum) {
            return freeShippingMinimum - currentTotal;
        }
        
        return undefined;
    }

    protected getBulkDiscountOpportunities(): any[] {
        // Default implementation - can be overridden
        return [];
    }

    protected getRecommendedItems(): any[] {
        // Default implementation - can be overridden
        return [];
    }

    // Common utility methods
    public getSessionId(): string {
        return this.session_id;
    }

    public getItemCount(): number {
        return this.items.length;
    }

    public getTotalQuantity(): number {
        return this.calculateItemCount();
    }

    public isEmpty(): boolean {
        return this.items.length === 0;
    }

    public hasItem(productId: number): boolean {
        return this.items.some(item => item.product_id === productId);
    }

    public findItem(productId: number): CartItem | undefined {
        return this.items.find(item => item.product_id === productId);
    }

    public addItem(item: CartItem): void {
        const existingItem = this.findItem(item.product_id);
        if (existingItem) {
            existingItem.updateQuantity(existingItem.quantity + item.quantity);
        } else {
            this.items.push(item);
        }
    }

    public removeItem(productId: number): boolean {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.product_id !== productId);
        return this.items.length < initialLength;
    }

    public updateItemQuantity(productId: number, quantity: number): boolean {
        const item = this.findItem(productId);
        if (item) {
            item.updateQuantity(quantity);
            return true;
        }
        return false;
    }

    public clear(): void {
        this.items = [];
    }

    public hasInsufficientStock(): boolean {
        return this.items.some(item => {
            const stockValidation = item.validateStock();
            return stockValidation.stockStatus === 'INSUFFICIENT';
        });
    }

    // Abstract methods that subclasses must implement
    public abstract getCartType(): string;
    protected abstract performCustomValidation(): { isValid: boolean; errors: string[] };

    // toJSON method to prevent circular references
    public toJSON(): any {
        return {
            session_id: this.session_id,
            items: this.items.map(item => item.toJSON()),
            created_at: this.created_at
        };
    }
}

// Standard Shopping Cart implementation
export class ShoppingCart extends Cart {
    public getCartType(): string {
        return 'SHOPPING';
    }

    protected performCustomValidation(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Standard carts have a maximum of 50 items
        if (this.items.length > 50) {
            errors.push('Shopping cart cannot contain more than 50 different items');
        }

        // Check total quantity
        const totalQuantity = this.getTotalQuantity();
        if (totalQuantity > 999) {
            errors.push('Total quantity in cart cannot exceed 999 items');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Cart Content interface for display purposes
export class CartContent {
    product_id!: number;
    title!: string;
    media_type!: string;
    current_price!: number;
    quantity!: number;
    subtotal!: number;
    available_stock!: number;
    stock_status!: 'INSUFFICIENT' | 'LOW' | 'AVAILABLE';
    can_rush_deliver!: boolean;

    constructor(data: any) {
        this.product_id = data.product_id;
        this.title = data.title;
        this.media_type = data.media_type;
        this.current_price = data.current_price;
        this.quantity = data.quantity;
        this.subtotal = data.subtotal;
        this.available_stock = data.available_stock;
        this.stock_status = data.stock_status;
        this.can_rush_deliver = data.can_rush_deliver;
    }

    public isInStock(): boolean {
        return this.stock_status !== 'INSUFFICIENT';
    }

    public isLowStock(): boolean {
        return this.stock_status === 'LOW';
    }

    public canRushDeliver(): boolean {
        return this.can_rush_deliver && this.isInStock();
    }

    public getPriceWithVAT(): number {
        return this.current_price * 1.1; // 10% VAT
    }

    public getSubtotalWithVAT(): number {
        return this.subtotal * 1.1; // 10% VAT
    }

    public toJSON(): any {
        return {
            product_id: this.product_id,
            title: this.title,
            media_type: this.media_type,
            current_price: this.current_price,
            quantity: this.quantity,
            subtotal: this.subtotal,
            available_stock: this.available_stock,
            stock_status: this.stock_status,
            can_rush_deliver: this.can_rush_deliver
        };
    }
}

// Cart summary class
export class CartSummary {
    items!: CartContent[];
    total_excluding_vat!: number;
    vat_amount!: number; // 10% VAT
    total_including_vat!: number;
    item_count!: number;
    has_insufficient_stock!: boolean;

    constructor(data: any) {
        this.items = data.items.map((item: any) => new CartContent(item));
        this.total_excluding_vat = data.total_excluding_vat;
        this.vat_amount = data.vat_amount;
        this.total_including_vat = data.total_including_vat;
        this.item_count = data.item_count;
        this.has_insufficient_stock = data.has_insufficient_stock;
    }

    public canProceedToCheckout(): boolean {
        return !this.has_insufficient_stock && this.items.length > 0;
    }

    public getInsufficientStockItems(): CartContent[] {
        return this.items.filter(item => item.stock_status === 'INSUFFICIENT');
    }

    public getLowStockItems(): CartContent[] {
        return this.items.filter(item => item.stock_status === 'LOW');
    }

    public getRushDeliveryEligibleItems(): CartContent[] {
        return this.items.filter(item => item.can_rush_deliver);
    }

    public calculateSavings(): number {
        // This would calculate savings from discounts, promotions, etc.
        return 0; // Placeholder implementation
    }

    public toJSON(): any {
        return {
            items: this.items.map(item => item.toJSON()),
            total_excluding_vat: this.total_excluding_vat,
            vat_amount: this.vat_amount,
            total_including_vat: this.total_including_vat,
            item_count: this.item_count,
            has_insufficient_stock: this.has_insufficient_stock
        };
    }
}

// Delivery fee calculation result class
export class DeliveryFeeResult {
    standard_delivery_fee!: number;
    rush_delivery_fee!: number;
    total_order_value!: number;
    heaviest_item_weight!: number;

    constructor(data: any) {
        this.standard_delivery_fee = data.standard_delivery_fee;
        this.rush_delivery_fee = data.rush_delivery_fee;
        this.total_order_value = data.total_order_value;
        this.heaviest_item_weight = data.heaviest_item_weight;
    }

    public getTotalDeliveryFee(isRushDelivery: boolean): number {
        return isRushDelivery ? 
            this.standard_delivery_fee + this.rush_delivery_fee : 
            this.standard_delivery_fee;
    }

    public toJSON(): any {
        return {
            standard_delivery_fee: this.standard_delivery_fee,
            rush_delivery_fee: this.rush_delivery_fee,
            total_order_value: this.total_order_value,
            heaviest_item_weight: this.heaviest_item_weight
        };
    }
}

// Cart validation result class
export class CartValidationResult {
    is_valid!: boolean;
    message!: string;
    invalid_items?: {
        product_id: number;
        title: string;
        requested: number;
        available: number;
    }[];

    constructor(data: any) {
        this.is_valid = data.is_valid;
        this.message = data.message;
        this.invalid_items = data.invalid_items;
    }

    public hasInvalidItems(): boolean {
        return !!(this.invalid_items && this.invalid_items.length > 0);
    }

    public getInvalidItemsCount(): number {
        return this.invalid_items?.length || 0;
    }

    public getValidationSummary(): string {
        if (this.is_valid) {
            return 'Cart validation passed';
        }

        let summary = this.message;
        if (this.hasInvalidItems()) {
            summary += ` (${this.getInvalidItemsCount()} invalid items)`;
        }
        return summary;
    }

    public toJSON(): any {
        return {
            is_valid: this.is_valid,
            message: this.message,
            invalid_items: this.invalid_items
        };
    }
}

// Legacy interface types for backward compatibility
export interface AddToCartParams {
    session_id: string;
    product_id: number;
    quantity: number;
}

export interface UpdateCartItemParams {
    session_id: string;
    product_id: number;
    quantity: number;
}

export interface RemoveFromCartParams {
    session_id: string;
    product_id: number;
}

export interface CalculateDeliveryFeeParams {
    session_id: string;
    province: string;
    address: string;
    is_rush_delivery?: boolean;
}