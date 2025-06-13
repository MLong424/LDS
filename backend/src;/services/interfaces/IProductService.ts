// src/services/interfaces/IProductService.ts
import {
    ProductUpdateData,
    ProductCreateData,
    CompleteProduct,
    PMProductSearchParams,
    ProductSearchParams,
    ProductSearchResult,
    ProductListItem,
    PriceHistoryItem,
} from '../../models/entity/Product';

// Public product browsing operations
export interface IProductBrowsingService {
    getProductById(id: number): Promise<CompleteProduct>;
    getRandomProducts(pageSize: number): Promise<ProductListItem[]>;
    searchProducts(params: ProductSearchParams): Promise<ProductSearchResult>;
    isProductRushDeliveryEligible(productId: number): Promise<boolean>;
}

// Product manager creation and management operations
export interface IProductManagementService {
    createProduct(data: ProductCreateData, userId: string): Promise<number>;
    updateProduct(productId: number, data: ProductUpdateData, userId: string): Promise<number>;
    pmViewProducts(params: PMProductSearchParams, userId: string): Promise<ProductSearchResult>;
    getProductPriceHistory(productId: number, userId?: string): Promise<PriceHistoryItem[]>;
}

// For backward compatibility - combines all interfaces
export interface IProductService extends IProductBrowsingService, IProductManagementService {}