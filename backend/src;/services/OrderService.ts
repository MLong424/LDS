// src/services/OrderService.ts - Updated for Factory integration
import { 
    ICustomerOrderService, 
    IAdminOrderService, 
    IOrderPaymentService 
} from './interfaces/IOrderService';
import {
    ICustomerOrderRepository,
    IAdminOrderRepository,
    IOrderPaymentRepository,
} from '../models/interfaces/IOrderRepository';
import {
    OrderDetail,
    CreateOrderParams,
    ApproveOrderParams,
    RejectOrderParams,
    PendingOrder,
} from '../models/entity/Order';
import { Payment } from '../models/entity/PaymentTransaction';
import { ProcessPaymentParams } from '../models/entity/common';

export class CustomerOrderService implements ICustomerOrderService {
    constructor(private customerOrderRepository: ICustomerOrderRepository) {}

    async createOrder(params: CreateOrderParams): Promise<string> {
        // Simple validation can stay if needed, but let database handle the heavy lifting
        return this.customerOrderRepository.createOrder(params);
    }

    async getOrderDetails(orderId: string): Promise<OrderDetail> {
        return this.customerOrderRepository.getOrderDetails(orderId);
    }

    async getOrderById(orderId: string, userId?: string): Promise<OrderDetail> {
        return this.customerOrderRepository.getOrderById(orderId, userId);
    }

    async calculateOrderTotals(orderId: string): Promise<{
        products_total: number;
        vat_amount: number;
        delivery_fee: number;
        rush_delivery_fee: number;
        total_amount: number;
    }> {
        return this.customerOrderRepository.calculateOrderTotals(orderId);
    }

    async getUserOrders(
        userId: string,
        page: number,
        pageSize: number,
        sortField: string,
        sortDirection: string
    ): Promise<any> {
        return this.customerOrderRepository.getUserOrders(userId, page, pageSize, sortField, sortDirection);
    }

    /**
     * Cancel an order - now uses Factory pattern for type-specific business logic
     */
    async cancelOrder(orderId: string): Promise<boolean> {
        try {
            // Get order details to determine type and apply business rules
            const orderDetails = await this.customerOrderRepository.getOrderDetails(orderId);
            
            // Use Template Method Pattern for validation if order supports it
            if (typeof orderDetails.canBeCanceled === 'function' && !orderDetails.canBeCanceled()) {
                throw new Error(`Cannot cancel order. Current status: ${orderDetails.order_status}. Only pending orders can be cancelled.`);
            }

            // For Rush orders, additional checks could be applied here if needed
            if (orderDetails.delivery_type === 'RUSH') {
                console.log(`Cancelling rush order ${orderId} - special handling may be required`);
            }

            return await this.customerOrderRepository.cancelOrder(orderId);
        } catch (error) {
            console.error('Error in CustomerOrderService.cancelOrder:', error);
            throw error;
        }
    }
}

export class AdminOrderService implements IAdminOrderService {
    constructor(private adminOrderRepository: IAdminOrderRepository) {}

    async approveOrder(params: ApproveOrderParams): Promise<boolean> {
        // Could add type-specific business logic here if needed
        return this.adminOrderRepository.approveOrder(params);
    }

    async rejectOrder(params: RejectOrderParams): Promise<boolean> {
        // Could add type-specific business logic here if needed
        return this.adminOrderRepository.rejectOrder(params);
    }

    async getPendingOrders(userId: string, page: number, pageSize: number): Promise<PendingOrder[]> {
        return this.adminOrderRepository.getPendingOrders(userId, page, pageSize);
    }

    async getAllOrdersByProductManager(
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
    ): Promise<any> {
        return this.adminOrderRepository.getAllOrdersByProductManager(
            userId,
            page,
            pageSize,
            sortField,
            sortDirection,
            status,
            paymentStatus,
            startDate,
            endDate,
            searchTerm
        );
    }
}

// For backward compatibility
export class OrderService implements ICustomerOrderService, IAdminOrderService {
    private customerService: CustomerOrderService;
    private adminService: AdminOrderService;

    constructor(
        customerOrderRepository: ICustomerOrderRepository,
        adminOrderRepository: IAdminOrderRepository
    ) {
        this.customerService = new CustomerOrderService(customerOrderRepository);
        this.adminService = new AdminOrderService(adminOrderRepository);
    }

    // Customer methods - delegate to customer service
    async createOrder(params: CreateOrderParams): Promise<string> {
        return this.customerService.createOrder(params);
    }

    async getOrderDetails(orderId: string): Promise<OrderDetail> {
        return this.customerService.getOrderDetails(orderId);
    }

    async getOrderById(orderId: string, userId?: string): Promise<OrderDetail> {
        return this.customerService.getOrderById(orderId, userId);
    }

    async calculateOrderTotals(orderId: string): Promise<{
        products_total: number;
        vat_amount: number;
        delivery_fee: number;
        rush_delivery_fee: number;
        total_amount: number;
    }> {
        return this.customerService.calculateOrderTotals(orderId);
    }

    async getUserOrders(
        userId: string,
        page: number,
        pageSize: number,
        sortField: string,
        sortDirection: string
    ): Promise<any> {
        return this.customerService.getUserOrders(userId, page, pageSize, sortField, sortDirection);
    }

    async cancelOrder(orderId: string): Promise<boolean> {
        return this.customerService.cancelOrder(orderId);
    }

    // Admin methods - delegate to admin service
    async approveOrder(params: ApproveOrderParams): Promise<boolean> {
        return this.adminService.approveOrder(params);
    }

    async rejectOrder(params: RejectOrderParams): Promise<boolean> {
        return this.adminService.rejectOrder(params);
    }

    async getPendingOrders(userId: string, page: number, pageSize: number): Promise<PendingOrder[]> {
        return this.adminService.getPendingOrders(userId, page, pageSize);
    }

    async getAllOrdersByProductManager(
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
    ): Promise<any> {
        return this.adminService.getAllOrdersByProductManager(
            userId,
            page,
            pageSize,
            sortField,
            sortDirection,
            status,
            paymentStatus,
            startDate,
            endDate,
            searchTerm
        );
    }
}

export class OrderPaymentService implements IOrderPaymentService {
    constructor(private orderPaymentRepository: IOrderPaymentRepository) {}

    async processPayment(params: ProcessPaymentParams): Promise<string> {
        return this.orderPaymentRepository.processPayment(params);
    }

    async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
        return this.orderPaymentRepository.getPaymentByOrderId(orderId);
    }
}