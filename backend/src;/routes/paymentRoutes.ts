// src/routes/paymentRoutes.ts
import express from 'express';
import { PaymentController, PaymentCallbackController } from '../controllers/PaymentController';
import authMiddleware from '../middlewares/auth';
import { IOrderService, IOrderPaymentService } from '../services/interfaces/IOrderService';
import { IEmailService } from '../services/interfaces/IEmailService';
import { IPaymentRepository } from '../models/interfaces/IPaymentRepository';

export function createPaymentRoutes(
    orderService: IOrderService, 
    orderPaymentService: IOrderPaymentService,
    emailService: IEmailService,
    paymentRepository: IPaymentRepository
) {
    const router = express.Router();
    const paymentController = new PaymentController(orderPaymentService, paymentRepository);
    const paymentCallbackController = new PaymentCallbackController(orderPaymentService, orderService, emailService, paymentRepository);

    // Get available payment methods
    router.get('/methods', paymentController.getPaymentMethods);
    
    // Get configuration requirements for a specific payment method
    router.get('/methods/:method/config', paymentController.getPaymentMethodConfig);
    
    // Check status of all payment methods
    router.get('/methods/status', paymentController.checkPaymentMethodStatus);
    
    // Create payment URL for an order (supports multiple payment methods)
    router.post('/create', authMiddleware, paymentController.createPayment);

    // Handle payment return callback (no auth required as this is called by payment provider)
    router.get('/return', paymentCallbackController.handlePaymentReturn);
    router.get('/callback/:method', paymentCallbackController.handleGenericCallback);

    return router;
}