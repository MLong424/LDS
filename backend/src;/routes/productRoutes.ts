// src/routes/productRoutes.ts
import express from 'express';
import ProductController from '../controllers/ProductController';
import authMiddleware from '../middlewares/auth';
import { IProductService } from '../services/interfaces/IProductService';

export function createProductRoutes(productService: IProductService) {
    const router = express.Router();
    const productController = new ProductController(productService, productService);

    // Public routes (no auth required)
    router.get('/random', productController.getRandomProducts);
    router.get('/search', productController.searchProducts);
    router.get('/:id', productController.getProductById);
    router.get('/:id/rush-eligibility', productController.checkRushDeliveryEligibility);

    // Product manager routes (require authentication)
    router.get('/manager/list', authMiddleware, productController.pmViewProducts);
    router.get('/:id/price-history', authMiddleware, productController.getProductPriceHistory);
    router.post('/', authMiddleware, productController.createProduct);
    router.put('/:id', authMiddleware, productController.updateProduct);

    return router;
}