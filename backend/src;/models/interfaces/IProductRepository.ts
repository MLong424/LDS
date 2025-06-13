// src/models/interfaces/IProductRepository.ts
import {
    CompleteProduct,
    ProductCreateData,
    ProductListItem,
    ProductSearchParams,
    ProductSearchResult,
    ProductUpdateData,
    PMProductSearchParams,
    PriceHistoryItem,
} from '../entity/Product';

export interface IProductRepository {
    createProduct(data: ProductCreateData, userId: string): Promise<number>;
    updateProduct(productId: number, data: ProductUpdateData, userId: string): Promise<number>;
    getProductById(productId: number): Promise<CompleteProduct>;
    searchProducts(params: ProductSearchParams): Promise<ProductSearchResult>;
    getRandomProducts(pageSize: number): Promise<ProductListItem[]>;
    pmViewProducts(params: PMProductSearchParams, userId: string): Promise<ProductSearchResult>;
    getProductPriceHistory(productId: number, userId?: string): Promise<PriceHistoryItem[]>
    isProductRushDeliveryEligible(productId: number): Promise<boolean>
}
