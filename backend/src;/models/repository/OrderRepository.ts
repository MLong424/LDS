// src/models/repository/OrderRepository.ts - Simplified updates
import { IDatabaseConnection } from '../../config/interfaces';
import { 
    ICustomerOrderRepository, 
    IAdminOrderRepository, 
    IOrderPaymentRepository 
} from '../interfaces/IOrderRepository';
import { Payment } from '../entity/PaymentTransaction';
import { ProcessPaymentParams } from '../entity/common';
import {
    Order,
    OrderDetail,
    CreateOrderParams,
    PendingOrder,
    ApproveOrderParams,
    RejectOrderParams,
} from '../entity/Order';
import { OrderFactory } from '../factory/OrderFactory';

class CustomerOrderRepository implements ICustomerOrderRepository {
    private db: IDatabaseConnection;
    
    constructor(db: IDatabaseConnection) {
        this.db = db;
    }

    /**
     * Create a new order - minimal changes
     */
    async createOrder(params: CreateOrderParams): Promise<string> {
        try {
            const {
                session_id,
                recipient_name,
                recipient_email,
                recipient_phone,
                delivery_province,
                delivery_address,
                delivery_type,
                rush_delivery_time,
                rush_delivery_instructions,
            } = params;

            // Database handles validation, just pass through
            const sqlQuery = 'SELECT create_order($1, $2, $3, $4, $5, $6, $7, $8, $9)';
            const values = [
                session_id,
                recipient_name,
                recipient_email,
                recipient_phone,
                delivery_province,
                delivery_address,
                delivery_type,
                rush_delivery_time,
                rush_delivery_instructions,
            ];

            const result = await this.db.query<{ create_order: string }>(sqlQuery, values);
            return result[0].create_order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get order details - use factory for object creation
     */
    async getOrderDetails(orderId: string): Promise<OrderDetail> {
        try {
            const sqlQuery = 'SELECT * FROM get_order_details($1)';
            const values = [orderId];

            const result = await this.db.query<any>(sqlQuery, values);
            if (result.length === 0) {
                throw new Error(`Order with ID ${orderId} not found`);
            }

            const orderData = result[0];
            
            // Use factory to create proper order type
            return this.createOrderDetailFromData(orderData);
        } catch (error) {
            console.error('Error getting order details:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get order by ID - use factory for object creation
     */
    async getOrderById(orderId: string, userId?: string): Promise<OrderDetail> {
        try {
            const sqlQuery = 'SELECT * FROM get_order_by_id($1, $2)';
            const values = [orderId, userId];

            const result = await this.db.query<any>(sqlQuery, values);
            if (result.length === 0) {
                throw new Error(`Order with ID ${orderId} not found`);
            }

            const orderData = result[0];
            return this.createOrderDetailFromData(orderData);
        } catch (error) {
            console.error('Error getting order:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async calculateOrderTotals(orderId: string): Promise<{
        products_total: number;
        vat_amount: number;
        delivery_fee: number;
        rush_delivery_fee: number;
        total_amount: number;
    }> {
        try {
            const sqlQuery = 'SELECT * FROM calculate_order_totals($1)';
            const values = [orderId];

            const result = await this.db.query<{
                products_total: number;
                vat_amount: number;
                delivery_fee: number;
                rush_delivery_fee: number;
                total_amount: number;
            }>(sqlQuery, values);

            if (result.length === 0) {
                throw new Error(`Order with ID ${orderId} not found`);
            }

            return result[0];
        } catch (error) {
            console.error('Error calculating order totals:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get user orders - use factory for object creation
     */
    async getUserOrders(
        userId: string,
        page: number = 1,
        pageSize: number = 20,
        sortField: string = 'created_at',
        sortDirection: string = 'DESC'
    ): Promise<{
        orders: Order[];
        total_count: number;
        total_pages: number;
    }> {
        try {
            const sqlQuery = 'SELECT * FROM get_user_orders($1, $2, $3, $4, $5)';
            const values = [userId, page, pageSize, sortField, sortDirection];

            const result: any = await this.db.query(sqlQuery, values);
            if (result.length === 0) {
                return { orders: [], total_count: 0, total_pages: 0 };
            }
            
            const total_count = result[0].total_count;
            const total_pages = result[0].total_pages;

            // Use factory to create proper order types
            const orders = result.map((row: any) => this.createOrderFromData(row));

            return { orders, total_count, total_pages };
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async cancelOrder(orderId: string): Promise<boolean> {
        try {
            const sqlQuery = 'SELECT cancel_order($1)';
            const values = [orderId];

            const result = await this.db.query<{ cancel_order: boolean }>(sqlQuery, values);
            return result[0].cancel_order;
        } catch (error) {
            console.error('Error canceling order:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create OrderDetail from database data using Factory
     */
    private createOrderDetailFromData(orderData: any): OrderDetail {
        const orderType = orderData.delivery_type === 'RUSH' ? 'RUSH' : 'STANDARD';
        const order = OrderFactory.createOrder(orderType, orderData) as OrderDetail;
        
        // Set additional OrderDetail properties
        order.items = orderData.items || [];
        order.payment_info = orderData.payment_info;
        order.status_history = orderData.status_history;
        
        return order;
    }

    /**
     * Create Order from database data using Factory
     */
    private createOrderFromData(orderData: any): Order {
        const orderType = orderData.delivery_type === 'RUSH' ? 'RUSH' : 'STANDARD';
        return OrderFactory.createOrder(orderType, orderData);
    }
}

class AdminOrderRepository implements IAdminOrderRepository {
    private db: IDatabaseConnection;
    
    constructor(db: IDatabaseConnection) {
        this.db = db;
    }

    async approveOrder(params: ApproveOrderParams): Promise<boolean> {
        try {
            const { order_id, user_id } = params;

            const sqlQuery = 'SELECT approve_order($1, $2)';
            const values = [order_id, user_id];

            const result = await this.db.query<{ approve_order: boolean }>(sqlQuery, values);
            return result[0].approve_order;
        } catch (error) {
            console.error('Error approving order:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async rejectOrder(params: RejectOrderParams): Promise<boolean> {
        try {
            const { order_id, user_id, reason } = params;

            const sqlQuery = 'SELECT reject_order($1, $2, $3)';
            const values = [order_id, user_id, reason];

            const result = await this.db.query<{ reject_order: boolean }>(sqlQuery, values);
            return result[0].reject_order;
        } catch (error) {
            console.error('Error rejecting order:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getPendingOrders(userId: string, page: number = 1, pageSize: number = 30): Promise<PendingOrder[]> {
        try {
            const sqlQuery = 'SELECT * FROM get_pending_orders($1, $2, $3)';
            const values = [userId, page, pageSize];

            return await this.db.query<PendingOrder>(sqlQuery, values);
        } catch (error) {
            console.error('Error getting pending orders:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all orders with filtering - use factory for object creation
     */
    async getAllOrdersByProductManager(
        userId: string,
        page: number = 1,
        pageSize: number = 30,
        sortField: string = 'created_at',
        sortDirection: string = 'DESC',
        status?: string,
        paymentStatus?: string,
        startDate?: Date,
        endDate?: Date,
        searchTerm?: string
    ): Promise<{
        orders: Order[];
        has_sufficient_stock: boolean;
        total_count: number;
        total_pages: number;
    }> {
        try {
            const sqlQuery = 'SELECT * FROM get_all_orders_by_product_manager($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
            const values = [
                userId,
                status,
                paymentStatus,
                startDate,
                endDate,
                searchTerm,
                page,
                pageSize,
                sortField,
                sortDirection,
            ];

            const result: any = await this.db.query(sqlQuery, values);
            if (result.length === 0) {
                return { orders: [], has_sufficient_stock: false, total_count: 0, total_pages: 0 };
            }
            
            const total_count = result[0].total_count;
            const total_pages = result[0].total_pages;
            const has_sufficient_stock = result[0].has_sufficient_stock;
            
            // Use factory to create proper order types
            const orders: Order[] = result.map((row: any) => {
                const orderType = row.delivery_type === 'RUSH' ? 'RUSH' : 'STANDARD';
                return OrderFactory.createOrder(orderType, row);
            });
            
            return { orders, has_sufficient_stock, total_count, total_pages };
        } catch (error) {
            console.error('Error getting all orders by product manager:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

class OrderPaymentRepository implements IOrderPaymentRepository {
    private db: IDatabaseConnection;
    
    constructor(db: IDatabaseConnection) {
        this.db = db;
    }

    async processPayment(params: ProcessPaymentParams): Promise<string> {
        try {
            const {
                orderId,
                payment_method,
                transaction_id,
                transaction_datetime,
                transaction_content,
                provider_data,
            } = params;

            const sqlQuery = 'SELECT process_payment($1, $2, $3, $4, $5, $6)';
            const values = [
                orderId,
                payment_method,
                transaction_id,
                transaction_datetime,
                transaction_content,
                provider_data,
            ];

            const result = await this.db.query<{ process_payment: string }>(sqlQuery, values);
            return result[0].process_payment;
        } catch (error) {
            console.error('Error processing payment:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
        try {
            const sqlQuery = 'SELECT * FROM payments WHERE order_id = $1';
            const values = [orderId];

            const result = await this.db.query<Payment>(sqlQuery, values);

            if (result.length === 0) {
                return null;
            }

            return result[0];
        } catch (error) {
            console.error('Error getting payment:', error);
            throw new Error(`${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

// For backward compatibility - combined repositories
class OrderRepository implements ICustomerOrderRepository {
    private customerOrderRepository: CustomerOrderRepository;

    constructor(db: IDatabaseConnection) {
        this.customerOrderRepository = new CustomerOrderRepository(db);
    }

    async createOrder(params: CreateOrderParams): Promise<string> {
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
        page?: number,
        pageSize?: number,
        sortField?: string,
        sortDirection?: string
    ): Promise<{ orders: Order[]; total_count: number; total_pages: number }> {
        return this.customerOrderRepository.getUserOrders(userId, page, pageSize, sortField, sortDirection);
    }

    async cancelOrder(orderId: string): Promise<boolean> {
        return this.customerOrderRepository.cancelOrder(orderId);
    }
}

class OrderManagementRepository implements IAdminOrderRepository {
    private adminOrderRepository: AdminOrderRepository;

    constructor(db: IDatabaseConnection) {
        this.adminOrderRepository = new AdminOrderRepository(db);
    }

    async approveOrder(params: ApproveOrderParams): Promise<boolean> {
        return this.adminOrderRepository.approveOrder(params);
    }

    async rejectOrder(params: RejectOrderParams): Promise<boolean> {
        return this.adminOrderRepository.rejectOrder(params);
    }

    async getPendingOrders(userId: string, page?: number, pageSize?: number): Promise<PendingOrder[]> {
        return this.adminOrderRepository.getPendingOrders(userId, page, pageSize);
    }

    async getAllOrdersByProductManager(
        userId: string,
        page?: number,
        pageSize?: number,
        sortField?: string,
        sortDirection?: string,
        status?: string,
        paymentStatus?: string,
        startDate?: Date,
        endDate?: Date,
        searchTerm?: string
    ): Promise<{
        orders: Order[];
        has_sufficient_stock: boolean;
        total_count: number;
        total_pages: number;
    }> {
        return this.adminOrderRepository.getAllOrdersByProductManager(
            userId, page, pageSize, sortField, sortDirection, 
            status, paymentStatus, startDate, endDate, searchTerm
        );
    }
}

export { 
    CustomerOrderRepository, 
    AdminOrderRepository, 
    OrderPaymentRepository,
    OrderRepository, 
    OrderManagementRepository 
};