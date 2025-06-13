// src/controllers/OrderController.ts - Updated for Factory integration
import { Request, Response } from 'express';
import { ICustomerOrderService, IAdminOrderService } from '../services/interfaces/IOrderService';
import { IEmailService } from '../services/interfaces/IEmailService';
import { ApproveOrderParams, CreateOrderParams, RejectOrderParams } from '../models/entity/Order';

export class CustomerOrderController {
    constructor(
        private customerOrderService: ICustomerOrderService,
        private emailService: IEmailService
    ) {
        this.createOrder = this.createOrder.bind(this);
        this.getOrderDetails = this.getOrderDetails.bind(this);
        this.getOrderById = this.getOrderById.bind(this);
        this.getUserOrders = this.getUserOrders.bind(this);
        this.cancelOrder = this.cancelOrder.bind(this);
    }

    async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.cookies?.session_id;
            if (!sessionId) {
                throw new Error('No session found');
            }

            const cartService = req.app.locals.cartService;
            const validationResult = await cartService.validateCart(sessionId);
            if (!validationResult.is_valid) {
                res.status(400).json({
                    status: 'error',
                    message: validationResult.message,
                    data: { invalid_items: validationResult.invalid_items },
                });
                return;
            }

            const orderData: CreateOrderParams = {
                session_id: sessionId,
                recipient_name: req.body.recipient_name,
                recipient_email: req.body.recipient_email,
                recipient_phone: req.body.recipient_phone,
                delivery_province: req.body.delivery_province,
                delivery_address: req.body.delivery_address,
                delivery_type: req.body.delivery_type,
                rush_delivery_time: req.body.rush_delivery_time,
                rush_delivery_instructions: req.body.rush_delivery_instructions,
            };

            // OrderFactory and database will handle validation
            const orderId = await this.customerOrderService.createOrder(orderData);
            const orderTotals = await this.customerOrderService.calculateOrderTotals(orderId);

            res.status(201).json({
                status: 'success',
                message: 'Order created successfully',
                data: {
                    order_id: orderId,
                    order_type: orderData.delivery_type === 'RUSH' ? 'Rush Order' : 'Standard Order',
                    ...orderTotals,
                },
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to create order',
            });
        }
    }

    async getOrderDetails(req: Request, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const orderDetails = await this.customerOrderService.getOrderDetails(orderId);
            
            res.status(200).json({
                status: 'success',
                data: {
                    ...orderDetails,
                    // Add helpful metadata
                    order_type: orderDetails.delivery_type === 'RUSH' ? 'Rush Order' : 'Standard Order',
                    can_be_canceled: typeof orderDetails.canBeCanceled === 'function' ? orderDetails.canBeCanceled() : orderDetails.order_status === 'PENDING_PROCESSING',
                },
            });
        } catch (error) {
            res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Order not found',
            });
        }
    }

    async getOrderById(req: Request, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            const userId = req.user?.id;
            const order = await this.customerOrderService.getOrderById(orderId, userId);

            res.status(200).json({
                status: 'success',
                data: {
                    ...order,
                    // Add helpful metadata
                    order_type: order.delivery_type === 'RUSH' ? 'Rush Order' : 'Standard Order',
                    can_be_canceled: typeof order.canBeCanceled === 'function' ? order.canBeCanceled() : order.order_status === 'PENDING_PROCESSING',
                },
            });
        } catch (error) {
            res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Order not found',
            });
        }
    }

    async getUserOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const pageSize = req.query.page_size ? parseInt(req.query.page_size as string) : 20;
            const sortField = (req.query.sort_field as string) || 'created_at';
            const sortDirection = (req.query.sort_direction as string) || 'DESC';

            const orders = await this.customerOrderService.getUserOrders(userId, page, pageSize, sortField, sortDirection);
            
            // Add metadata to each order
            if (orders.orders) {
                orders.orders = orders.orders.map((order: any) => ({
                    ...order,
                    order_type: order.delivery_type === 'RUSH' ? 'Rush Order' : 'Standard Order',
                    can_be_canceled: order.order_status === 'PENDING_PROCESSING',
                }));
            }

            res.status(200).json({
                status: 'success',
                data: orders,
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to get user orders',
            });
        }
    }

    async cancelOrder(req: Request, res: Response): Promise<void> {
        try {
            const orderId = req.params.id;
            
            // Service layer will handle business logic using Factory/Template patterns
            await this.customerOrderService.cancelOrder(orderId);

            // Send cancellation email notification
            const orderDetails = await this.customerOrderService.getOrderDetails(orderId);
            await this.emailService.sendOrderCancellationEmail(orderDetails.recipient_email, orderDetails);

            res.status(200).json({
                status: 'success',
                message: `${orderDetails.delivery_type === 'RUSH' ? 'Rush order' : 'Order'} cancelled successfully`,
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to cancel order',
            });
        }
    }
}

export class AdminOrderController {
    constructor(
        private customerOrderService: ICustomerOrderService,
        private adminOrderService: IAdminOrderService,
        private emailService: IEmailService
    ) {
        this.getPendingOrders = this.getPendingOrders.bind(this);
        this.approveOrder = this.approveOrder.bind(this);
        this.rejectOrder = this.rejectOrder.bind(this);
        this.getAllOrders = this.getAllOrders.bind(this);
    }

    async getPendingOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const pageSize = req.query.page_size ? parseInt(req.query.page_size as string) : 30;

            const pendingOrders = await this.adminOrderService.getPendingOrders(userId, page, pageSize);

            // Add metadata to identify order types
            const ordersWithMetadata = pendingOrders.map(order => ({
                ...order,
                order_type: order.payment_status === 'COMPLETED' ? 'Paid Order' : 'Unpaid Order',
                requires_immediate_attention: order.payment_status === 'COMPLETED',
            }));

            res.status(200).json({
                status: 'success',
                data: {
                    orders: ordersWithMetadata,
                    page,
                    page_size: pageSize,
                },
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to get pending orders',
            });
        }
    }

    async approveOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const params: ApproveOrderParams = {
                order_id: req.params.id,
                user_id: userId,
            };

            // Get order details first to show helpful messages
            const orderDetails = await this.customerOrderService.getOrderDetails(params.order_id);
            const isRushOrder = orderDetails.delivery_type === 'RUSH';

            await this.adminOrderService.approveOrder(params);

            // Send approval email notification
            await this.emailService.sendOrderApprovalEmail(orderDetails.recipient_email, orderDetails);

            res.status(200).json({
                status: 'success',
                message: `${isRushOrder ? 'Rush order' : 'Order'} approved successfully`,
                data: {
                    order_type: isRushOrder ? 'Rush Order' : 'Standard Order',
                    estimated_processing: isRushOrder ? '1-2 business days' : '3-5 business days',
                },
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to approve order',
            });
        }
    }

    async rejectOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const params: RejectOrderParams = {
                order_id: req.params.id,
                user_id: userId,
                reason: req.body.reason,
            };

            if (!params.reason) {
                throw new Error('Rejection reason is required');
            }

            // Get order details first
            const orderDetails = await this.customerOrderService.getOrderDetails(params.order_id);
            const isRushOrder = orderDetails.delivery_type === 'RUSH';

            await this.adminOrderService.rejectOrder(params);

            // Send rejection email notification
            await this.emailService.sendOrderRejectionEmail(orderDetails.recipient_email, orderDetails, params.reason);

            res.status(200).json({
                status: 'success',
                message: `${isRushOrder ? 'Rush order' : 'Order'} rejected successfully`,
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to reject order',
            });
        }
    }

    async getAllOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const status = req.query.status as string;
            const paymentStatus = req.query.payment_status as string;
            const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
            const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;
            const searchTerm = req.query.search as string;

            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const pageSize = req.query.page_size ? parseInt(req.query.page_size as string) : 30;
            const sortField = (req.query.sort_field as string) || 'created_at';
            const sortDirection = (req.query.sort_direction as string) || 'DESC';

            const orders = await this.adminOrderService.getAllOrdersByProductManager(
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

            // Add metadata to orders
            if (orders.orders) {
                orders.orders = orders.orders.map((order: any) => ({
                    ...order,
                    order_type: order.delivery_type === 'RUSH' ? 'Rush Order' : 'Standard Order',
                    priority: order.delivery_type === 'RUSH' ? 'HIGH' : 'NORMAL',
                }));
            }

            res.status(200).json({
                status: 'success',
                data: orders,
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to get orders',
            });
        }
    }
}