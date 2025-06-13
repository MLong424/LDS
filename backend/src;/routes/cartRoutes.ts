// src/routes/cartRoutes.ts
import express from 'express';
import { CartController } from '../controllers/CartController';
import { ICartService } from '../services/interfaces/ICartService';

export function createCartRoutes(cartService: ICartService) {
    const router = express.Router();
    const cartController = new CartController(cartService);

    router.get('/initialize', cartController.initializeCart);
    router.get('/', cartController.getCart);
    router.get('/validate', cartController.validateCart);
    router.post('/items', cartController.addToCart);
    router.put('/items/:productId', cartController.updateCartItem);
    router.delete('/items/:productId', cartController.removeFromCart);
    router.post('/delivery-fees', cartController.calculateDeliveryFees);
    router.delete('/', cartController.clearCart);

    return router;
}
