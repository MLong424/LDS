// src/services/interfaces/IOrderService.ts
import {
    OrderDetail,
    CreateOrderParams,
    ApproveOrderParams,
    RejectOrderParams,
    PendingOrder,
} from '../../models/entity/Order';

import { Payment } from '../../models/entity/PaymentTransaction';
import { ProcessPaymentParams } from '../../models/entity/common';

// Split IOrderService into smaller, focused interfaces

// Customer-facing order operations
export interface ICustomerOrderService {
    createOrder(params: CreateOrderParams): Promise<string>;
    getOrderDetails(orderId: string): Promise<OrderDetail>;
    getOrderById(orderId: string, userId?: string): Promise<OrderDetail>;
    calculateOrderTotals(orderId: string): Promise<{
        products_total: number;
        vat_amount: number;
        delivery_fee: number;
        rush_delivery_fee: number;
        total_amount: number;
    }>;
    getUserOrders(
        userId: string,
        page: number,
        pageSize: number,
        sortField: string,
        sortDirection: string
    ): Promise<any>;
    cancelOrder(orderId: string): Promise<boolean>;
}

// Admin-only order management operations
export interface IAdminOrderService {
    approveOrder(params: ApproveOrderParams): Promise<boolean>;
    rejectOrder(params: RejectOrderParams): Promise<boolean>;
    getPendingOrders(userId: string, page: number, pageSize: number): Promise<PendingOrder[]>;
    getAllOrdersByProductManager(
        userId: string,
        page: number,
        pageSize: number,
        sortField: string,
        sortDirection: string,
        status?: string,
        paymentStatus?: string,
        startDate?: Date,
        endDate?: Date,
        searchTerm?: string
    ): Promise<any>;
}

// Payment-specific operations
export interface IOrderPaymentService {
    processPayment(params: ProcessPaymentParams): Promise<string>;
    getPaymentByOrderId(orderId: string): Promise<Payment | null>;
}

// For backward compatibility - combines all interfaces
export interface IOrderService extends ICustomerOrderService {}
export interface IOrderManagementService extends IAdminOrderService {}