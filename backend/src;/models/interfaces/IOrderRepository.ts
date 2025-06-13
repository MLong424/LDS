// src/models/interfaces/IOrderRepository.ts
import {
    Order,
    OrderDetail,
    CreateOrderParams,
    PendingOrder,
    ApproveOrderParams,
    RejectOrderParams
} from '../entity/Order';
import { Payment } from '../entity/PaymentTransaction';
import { ProcessPaymentParams } from '../entity/common';

// Customer order operations interface
export interface ICustomerOrderRepository {
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
        page?: number,
        pageSize?: number,
        sortField?: string,
        sortDirection?: string
    ): Promise<{ orders: Order[]; total_count: number; total_pages: number }>;
    cancelOrder(orderId: string): Promise<boolean>;
}

// Admin order management operations interface
export interface IAdminOrderRepository {
    approveOrder(params: ApproveOrderParams): Promise<boolean>;
    rejectOrder(params: RejectOrderParams): Promise<boolean>;
    getPendingOrders(userId: string, page?: number, pageSize?: number): Promise<PendingOrder[]>;
    getAllOrdersByProductManager(
        userId: string,
        page?: number,
        pageSize?: number,
        sortField?: string,
        sortDirection?: string,
        status?: string,
        paymentStatus?: string,
        startDate?: Date,
        endDate?: Date,
        searchTerm?: string,
    ): Promise<{
        orders: Order[];
        has_sufficient_stock: boolean;
        total_count: number;
        total_pages: number;
    }>;
}

// Payment operations interface
export interface IOrderPaymentRepository {
    processPayment(params: ProcessPaymentParams): Promise<string>;
    getPaymentByOrderId(orderId: string): Promise<Payment | null>;
}

// For backward compatibility - combines all interfaces
export interface IOrderRepository extends ICustomerOrderRepository {}
export interface IOrderManagementRepository extends IAdminOrderRepository {}