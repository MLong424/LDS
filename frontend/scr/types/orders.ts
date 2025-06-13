import { MediaType } from "./products";
import { PaymentStatus, Sort } from "./common";
import { PaymentInfo } from "./payments";
// src/types/orders.ts
export type DeliveryType = 'STANDARD' | 'RUSH';
export type OrderStatus = 'PENDING_PROCESSING' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
export type SortField = 'created_at' | 'total_amount' | 'order_status' | 'payment_status';
export type PM_SortField = 'created_at' |'total_amount' |'order_status' |'payment_status' |'recipient_name';

export type OrderDto = {
    recipient_name: string;
    recipient_email: string;
    recipient_phone: string;
    delivery_province: string;
    delivery_address: string;
    delivery_type: DeliveryType;
    rush_delivery_time?: string;
    rush_delivery_instructions?: string;
};

export type OrderItem = {
    product_id: number;
    product_title: string;
    quantity: number;
    unit_price: number;
    is_rush_delivery: boolean;
    media_type: MediaType;
};

export type OrderStatusHistory = {
    new_status: OrderStatus;
    changed_at: string;
    changed_by?: string;
    notes?: string;
};

export type Order = {
    id: string;
    order_id: string;
    recipient_name: string;
    recipient_email: string;
    recipient_phone: string;
    delivery_province: string;
    delivery_address: string;
    delivery_type: DeliveryType;
    rush_delivery_time?: string;
    rush_delivery_instructions?: string;
    products_total: number;
    vat_amount: number;
    delivery_fee: number;
    rush_delivery_fee: number;
    total_amount: number;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    created_at: string;
    rejected_reason?: string;
    items: OrderItem[];
    payment_info: PaymentInfo[];
    status_history: OrderStatusHistory[];
};

export type OrderSummary = {
    id: string;
    recipient_name: string;
    recipient_email: string;
    delivery_province: string;
    delivery_address: string;
    total_amount: number;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    created_at: string;
};

export type PendingOrder = {
    id: string;
    recipient_name: string;
    recipient_email: string;
    recipient_phone: string;
    delivery_province: string;
    delivery_address: string;
    total_amount: number;
    payment_status: PaymentStatus;
    created_at: string;
    has_sufficient_stock: boolean;
};

export type MyOrdersParams = {
    page?: number;
    page_size?: number;
    sort_field?: SortField;
    sort_direction?: Sort;
};

export type PMOrdersParams = {
    page?: number;
    page_size?: number;
    sort_field?: PM_SortField;
    sort_direction?: Sort;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    search?: string;
    start_date?: string;
    end_date?: string;
};