// src/controllers/ProductController.ts
import { Request, Response } from 'express';
import { ProductCreateData, ProductUpdateData, ProductSearchParams, PMProductSearchParams } from '../models/entity/Product';
import { IProductBrowsingService, IProductManagementService } from '../services/interfaces/IProductService';

class PublicProductController {
    constructor(private productBrowsingService: IProductBrowsingService) {
        this.getProductById = this.getProductById.bind(this);
        this.searchProducts = this.searchProducts.bind(this);
        this.getRandomProducts = this.getRandomProducts.bind(this);
        this.checkRushDeliveryEligibility = this.checkRushDeliveryEligibility.bind(this);
    }

    async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                throw new Error('Invalid product ID');
            }

            const product = await this.productBrowsingService.getProductById(productId);

            res.status(200).json({
                status: 'success',
                data: product
            });
        } catch (error) {
            res.status(404).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Product not found',
            });
        }
    }

    async searchProducts(req: Request, res: Response): Promise<void> {
        try {
            const params: ProductSearchParams = {
                title: req.query.title as string | undefined,
                media_type: req.query.media_type as any,
                min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
                max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
                author_artist: req.query.author_artist as string | undefined,
                sort_by: req.query.sort_by as any || 'title',
                sort_order: req.query.sort_order as any || 'asc',
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                page_size: req.query.page_size ? parseInt(req.query.page_size as string) : 20
            };

            const results = await this.productBrowsingService.searchProducts(params);

            res.status(200).json({
                status: 'success',
                data: results
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to search products',
            });
        }
    }

    async getRandomProducts(req: Request, res: Response): Promise<void> {
        try {
            const pageSize = req.query.page_size ? parseInt(req.query.page_size as string) : 20;
            const products = await this.productBrowsingService.getRandomProducts(pageSize);

            res.status(200).json({
                status: 'success',
                data: products
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to get random products',
            });
        }
    }

    async checkRushDeliveryEligibility(req: Request, res: Response): Promise<void> {
        try {
            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                throw new Error('Invalid product ID');
            }

            const isEligible = await this.productBrowsingService.isProductRushDeliveryEligible(productId);

            res.status(200).json({
                status: 'success',
                data: {
                    product_id: productId,
                    is_eligible: isEligible
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to check eligibility',
            });
        }
    }
}

class ProductManagerController {
    constructor(
        private productBrowsingService: IProductBrowsingService,
        private productManagementService: IProductManagementService
    ) {
        this.createProduct = this.createProduct.bind(this);
        this.updateProduct = this.updateProduct.bind(this);
        this.pmViewProducts = this.pmViewProducts.bind(this);
        this.getProductPriceHistory = this.getProductPriceHistory.bind(this);
    }

    async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const productData: ProductCreateData = req.body;
            const productId = await this.productManagementService.createProduct(productData, userId);

            res.status(201).json({
                status: 'success',
                message: 'Product created successfully',
                data: { 
                    product_id: productId 
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to create product',
            });
        }
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                throw new Error('Invalid product ID');
            }

            const productData: ProductUpdateData = req.body;
            await this.productManagementService.updateProduct(productId, productData, userId);

            res.status(200).json({
                status: 'success',
                message: 'Product updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update product',
            });
        }
    }

    async pmViewProducts(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User ID not found in request');
            }

            const params: PMProductSearchParams = {
                title: req.query.title as string | undefined,
                media_type: req.query.media_type as any,
                min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
                max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
                include_out_of_stock: req.query.include_out_of_stock === 'true',
                manager_sort_by: req.query.manager_sort_by as any || 'id',
                sort_order: req.query.sort_order as any || 'asc',
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                page_size: req.query.page_size ? parseInt(req.query.page_size as string) : 20
            };

            const results = await this.productManagementService.pmViewProducts(params, userId);

            res.status(200).json({
                status: 'success',
                data: results
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to retrieve products',
            });
        }
    }

    async getProductPriceHistory(req: Request, res: Response): Promise<void> {
        try {
            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                throw new Error('Invalid product ID');
            }

            const userId = req.user?.id;
            const priceHistory = await this.productManagementService.getProductPriceHistory(productId, userId);

            res.status(200).json({
                status: 'success',
                data: priceHistory
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to get price history',
            });
        }
    }
}

// Combined controller for backward compatibility
class ProductController {
    private publicController: PublicProductController;
    private managerController: ProductManagerController;

    constructor(
        productBrowsingService: IProductBrowsingService,
        productManagementService: IProductManagementService
    ) {
        this.publicController = new PublicProductController(productBrowsingService);
        this.managerController = new ProductManagerController(productBrowsingService, productManagementService);
        
        // Bind all methods
        this.createProduct = this.managerController.createProduct;
        this.updateProduct = this.managerController.updateProduct;
        this.getProductById = this.publicController.getProductById;
        this.searchProducts = this.publicController.searchProducts;
        this.getRandomProducts = this.publicController.getRandomProducts;
        this.pmViewProducts = this.managerController.pmViewProducts;
        this.getProductPriceHistory = this.managerController.getProductPriceHistory;
        this.checkRushDeliveryEligibility = this.publicController.checkRushDeliveryEligibility;
    }

    createProduct: ProductManagerController['createProduct'];
    updateProduct: ProductManagerController['updateProduct'];
    getProductById: PublicProductController['getProductById'];
    searchProducts: PublicProductController['searchProducts'];
    getRandomProducts: PublicProductController['getRandomProducts'];
    pmViewProducts: ProductManagerController['pmViewProducts'];
    getProductPriceHistory: ProductManagerController['getProductPriceHistory'];
    checkRushDeliveryEligibility: PublicProductController['checkRushDeliveryEligibility'];
}

export { PublicProductController, ProductManagerController };
export default ProductController;