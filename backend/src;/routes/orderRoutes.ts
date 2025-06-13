// src/routes/orderRoutes.ts
import express from 'express';
import { CustomerOrderController, AdminOrderController } from '../controllers/OrderController';
import authMiddleware from '../middlewares/auth';
import { ICustomerOrderService, IAdminOrderService } from '../services/interfaces/IOrderService';
import { IEmailService } from '../services/interfaces/IEmailService';

// Function to create order routes with segregated interfaces
export function createOrderRoutes(
    customerOrderService: ICustomerOrderService, 
    adminOrderService: IAdminOrderService,
    emailService: IEmailService
) {
    const router = express.Router();
    const customerOrderController = new CustomerOrderController(customerOrderService, emailService);
    const adminOrderController = new AdminOrderController(customerOrderService, adminOrderService, emailService);
    
    // Customer routes (no authentication required for creation)
    router.post('/create', customerOrderController.createOrder);
    
    // Personal routes (require authentication)
    router.get('/my-orders', authMiddleware, customerOrderController.getUserOrders);
    router.get('/by/:id', authMiddleware, customerOrderController.getOrderById);
    router.get('/details/:id', authMiddleware, customerOrderController.getOrderDetails);
    router.post('/cancel/:id', authMiddleware, customerOrderController.cancelOrder);

    // Admin routes (require authentication)
    router.get('/pending', authMiddleware, adminOrderController.getPendingOrders);
    router.post('/approve/:id', authMiddleware, adminOrderController.approveOrder);
    router.post('/reject/:id', authMiddleware, adminOrderController.rejectOrder);
    router.get('/all', authMiddleware, adminOrderController.getAllOrders);

    return router;
}