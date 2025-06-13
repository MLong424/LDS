import { MediaType } from './products'
// src/types/cart.ts
export type CartItem = {
    product_id: number;
    title: string;
    media_type: MediaType;
    current_price: number;
    quantity: number;
    subtotal: number;
    available_stock: number;
    stock_status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    can_rush_deliver: boolean;
};

export type Cart = {
    items: CartItem[];
    total_excluding_vat: number;
    vat_amount: number;
    total_including_vat: number;
    item_count: number;
    has_insufficient_stock: boolean;
};

export type CartValidationResult = {
    is_valid: boolean;
    message: string;
    invalid_items?: Array<{
        product_id: number;
        title: string;
        requested: number;
        available: number;
    }>;
};

export type DeliveryFeeCalculation = {
    province: string;
    address: string;
    is_rush_delivery: boolean;
};

export type DeliveryFeeResult = {
    standard_delivery_fee: number;
    rush_delivery_fee: number;
    free_shipping_applied: boolean;
    total_order_value: number;
    heaviest_item_weight: number;
};
