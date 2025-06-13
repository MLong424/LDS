// src/services/ProductService.ts
import {
    ProductUpdateData,
    ProductCreateData,
    CompleteProduct,
    PMProductSearchParams,
    ProductSearchParams,
    ProductSearchResult,
    ProductListItem,
    PriceHistoryItem,
} from '../models/entity/Product';
import { 
    IProductBrowsingService, 
    IProductManagementService 
} from './interfaces/IProductService';
import { IProductRepository } from '../models/interfaces/IProductRepository';
import { ProductFactory } from '../models/factory/ProductFactory';

export class ProductBrowsingService implements IProductBrowsingService {
    constructor(private productRepository: IProductRepository) {}

    async getProductById(id: number): Promise<CompleteProduct> {
        try {
            const product = await this.productRepository.getProductById(id);
            
            // Additional validation using factory (Open for extension)
            if (!ProductFactory.isMediaTypeSupported(product.media_type)) {
                throw new Error(`Product has unsupported media type: ${product.media_type}`);
            }

            return product;
        } catch (error) {
            console.error('Error in ProductBrowsingService.getProductById:', error);
            throw error;
        }
    }

    async getRandomProducts(pageSize: number): Promise<ProductListItem[]> {
        try {
            // Validate page size with extensible rules
            this.validatePageSize(pageSize);
            return await this.productRepository.getRandomProducts(pageSize);
        } catch (error) {
            console.error('Error in ProductBrowsingService.getRandomProducts:', error);
            throw error;
        }
    }

    async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
        try {
            // Validate media type if provided using factory (Open for extension)
            if (params.media_type && !ProductFactory.isMediaTypeSupported(params.media_type)) {
                throw new Error(`Unsupported media type: ${params.media_type}`);
            }

            // Validate parameters with extensible rules
            this.validateSearchParameters(params);
            return await this.productRepository.searchProducts(params);
        } catch (error) {
            console.error('Error in ProductBrowsingService.searchProducts:', error);
            throw error;
        }
    }

    async isProductRushDeliveryEligible(productId: number): Promise<boolean> {
        try {
            // Get product details first to validate business rules
            const product = await this.getProductById(productId);
            
            // Create product instance for business validation using factory (Open for extension)
            const productInstance = ProductFactory.createProduct(product.media_type, product);
            
            // Check if product is in stock (basic requirement for rush delivery)
            if (!productInstance.isInStock()) {
                return false;
            }

            // Check stock validation for rush delivery
            const stockValidation = productInstance.validateStock(1);
            if (!stockValidation.isValid) {
                return false;
            }

            // Check repository-level eligibility rules (Closed for modification)
            return await this.productRepository.isProductRushDeliveryEligible(productId);
        } catch (error) {
            console.error('Error in ProductBrowsingService.isProductRushDeliveryEligible:', error);
            throw error;
        }
    }

    private validatePageSize(pageSize: number): void {
        if (pageSize <= 0 || pageSize > 100) {
            throw new Error('Page size must be between 1 and 100');
        }
    }

    private validateSearchParameters(params: ProductSearchParams): void {
        if (params.page && params.page < 1) {
            throw new Error('Page number must be greater than 0');
        }
        if (params.page_size && (params.page_size < 1 || params.page_size > 100)) {
            throw new Error('Page size must be between 1 and 100');
        }
        if (params.min_price && params.max_price && params.min_price > params.max_price) {
            throw new Error('Minimum price cannot be greater than maximum price');
        }
    }
}

export class ProductManagementService implements IProductManagementService {
    constructor(private productRepository: IProductRepository) {}

    async createProduct(data: ProductCreateData, userId: string): Promise<number> {
        try {
            // Factory validation (Open for extension)
            const validation = ProductFactory.validateProductData(data.media_type, data);
            if (!validation.isValid) {
                throw new Error(`Product validation failed: ${validation.errors.join(', ')}`);
            }

            if (!ProductFactory.isMediaTypeSupported(data.media_type)) {
                throw new Error(`Unsupported media type: ${data.media_type}`);
            }

            // Create product instance for business validation (Open for extension)
            const product = ProductFactory.createProduct(data.media_type, data);
            
            // Apply business rules (Open for extension)
            const stockValidation = product.validateStock(1);
            if (!stockValidation.isValid) {
                throw new Error(`Stock validation failed: ${stockValidation.message}`);
            }

            // Repository operation (Closed for modification)
            return await this.productRepository.createProduct(data, userId);
        } catch (error) {
            console.error('Error in ProductManagementService.createProduct:', error);
            throw error;
        }
    }

    async updateProduct(productId: number, data: ProductUpdateData, userId: string): Promise<number> {
        try {
            // Get existing product to determine media type and validate updates
            const existingProduct = await this.productRepository.getProductById(productId);
            
            // Create merged data for validation
            const mergedData: ProductCreateData = {
                ...existingProduct,
                ...data,
                media_type: existingProduct.media_type
            };

            // Factory validation (Open for extension)
            const validation = ProductFactory.validateProductData(existingProduct.media_type, mergedData);
            if (!validation.isValid) {
                throw new Error(`Product validation failed: ${validation.errors.join(', ')}`);
            }

            // Create product instance for business validation (Open for extension)
            const product = ProductFactory.createProduct(existingProduct.media_type, mergedData);
            
            // Apply business rules (Open for extension)
            if (data.stock !== undefined) {
                const stockValidation = product.validateStock(1);
                if (!stockValidation.isValid) {
                    throw new Error(`Stock validation failed: ${stockValidation.message}`);
                }
            }

            // Repository operation (Closed for modification)
            return await this.productRepository.updateProduct(productId, data, userId);
        } catch (error) {
            console.error('Error in ProductManagementService.updateProduct:', error);
            throw error;
        }
    }

    async pmViewProducts(params: PMProductSearchParams, userId: string): Promise<ProductSearchResult> {
        try {
            // Validate media type if provided using factory (Open for extension)
            if (params.media_type && !ProductFactory.isMediaTypeSupported(params.media_type)) {
                throw new Error(`Unsupported media type: ${params.media_type}`);
            }

            // Validate parameters with extensible rules
            this.validatePMSearchParameters(params);
            return await this.productRepository.pmViewProducts(params, userId);
        } catch (error) {
            console.error('Error in ProductManagementService.pmViewProducts:', error);
            throw error;
        }
    }

    async getProductPriceHistory(productId: number, userId?: string): Promise<PriceHistoryItem[]> {
        try {
            return await this.productRepository.getProductPriceHistory(productId, userId);
        } catch (error) {
            console.error('Error in ProductManagementService.getProductPriceHistory:', error);
            throw error;
        }
    }

    private validatePMSearchParameters(params: PMProductSearchParams): void {
        if (params.page && params.page < 1) {
            throw new Error('Page number must be greater than 0');
        }
        if (params.page_size && (params.page_size < 1 || params.page_size > 100)) {
            throw new Error('Page size must be between 1 and 100');
        }
        if (params.min_price && params.max_price && params.min_price > params.max_price) {
            throw new Error('Minimum price cannot be greater than maximum price');
        }
    }
}

// For backward compatibility
export class ProductService implements IProductBrowsingService, IProductManagementService {
    private browsingService: ProductBrowsingService;
    private managementService: ProductManagementService;

    constructor(productRepository: IProductRepository) {
        this.browsingService = new ProductBrowsingService(productRepository);
        this.managementService = new ProductManagementService(productRepository);
    }

    // Browsing methods
    async getProductById(id: number): Promise<CompleteProduct> {
        return this.browsingService.getProductById(id);
    }

    async getRandomProducts(pageSize: number): Promise<ProductListItem[]> {
        return this.browsingService.getRandomProducts(pageSize);
    }

    async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
        return this.browsingService.searchProducts(params);
    }

    async isProductRushDeliveryEligible(productId: number): Promise<boolean> {
        return this.browsingService.isProductRushDeliveryEligible(productId);
    }

    // Management methods
    async createProduct(data: ProductCreateData, userId: string): Promise<number> {
        return this.managementService.createProduct(data, userId);
    }

    async updateProduct(productId: number, data: ProductUpdateData, userId: string): Promise<number> {
        return this.managementService.updateProduct(productId, data, userId);
    }

    async pmViewProducts(params: PMProductSearchParams, userId: string): Promise<ProductSearchResult> {
        return this.managementService.pmViewProducts(params, userId);
    }

    async getProductPriceHistory(productId: number, userId?: string): Promise<PriceHistoryItem[]> {
        return this.managementService.getProductPriceHistory(productId, userId);
    }

    // Additional methods for backward compatibility
    getSupportedMediaTypes() {
        return ProductFactory.getSupportedMediaTypes();
    }

    validateProductData(data: ProductCreateData) {
        return ProductFactory.validateProductData(data.media_type, data);
    }
}