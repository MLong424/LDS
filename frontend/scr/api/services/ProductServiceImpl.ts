import { AxiosInstance, AxiosResponse } from 'axios';
import { Product, ProductSearchParams } from '@cusTypes/products';
import { ApiResponse } from '@cusTypes/common';
import { IProductService } from '../interfaces/IApiService';

export default class ProductServiceImpl implements IProductService {
    constructor(private apiClient: AxiosInstance) {}

    // New standardized interface methods
    getAllProducts(filters?: ProductSearchParams): Promise<AxiosResponse<ApiResponse<Product[]>>> {
        return this.apiClient.get<ApiResponse<Product[]>>('/products', { params: filters });
    }

    getProduct(id: number): Promise<AxiosResponse<ApiResponse<Product>>> {
        return this.apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    }

    createProduct(productData: Partial<Product>): Promise<AxiosResponse<ApiResponse<Product>>> {
        return this.apiClient.post<ApiResponse<Product>>('/products', productData);
    }

    updateProduct(id: number, productData: Partial<Product>): Promise<AxiosResponse<ApiResponse<Product>>> {
        return this.apiClient.put<ApiResponse<Product>>(`/products/${id}`, productData);
    }

    deleteProduct(id: number): Promise<AxiosResponse<ApiResponse>> {
        return this.apiClient.delete<ApiResponse>(`/products/${id}`);
    }

    // Legacy service methods for backward compatibility
    getRandomProducts(pageSize = 20): Promise<AxiosResponse<ApiResponse<Product[]>>> {
        return this.apiClient.get<ApiResponse<Product[]>>('/products/random', {
            params: { page_size: pageSize },
        });
    }

    searchProducts(params: ProductSearchParams): Promise<AxiosResponse<ApiResponse<{
        products: Product[];
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>>> {
        return this.apiClient.get<
            ApiResponse<{
                products: Product[];
                total_count: number;
                page: number;
                page_size: number;
                total_pages: number;
            }>
        >('/products/search', { params });
    }

    getProductDetails(id: number): Promise<AxiosResponse<ApiResponse<any>>> {
        return this.apiClient.get<ApiResponse<any>>(`/products/${id}`);
    }

    checkRushEligibility(id: number): Promise<AxiosResponse<ApiResponse<{
        product_id: number;
        is_eligible: boolean;
    }>>> {
        return this.apiClient.get<
            ApiResponse<{
                product_id: number;
                is_eligible: boolean;
            }>
        >(`/products/${id}/rush-eligibility`);
    }

    getProductList(params: any): Promise<AxiosResponse<ApiResponse<{
        products: Product[];
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>>> {
        return this.apiClient.get<
            ApiResponse<{
                products: Product[];
                total_count: number;
                page: number;
                page_size: number;
                total_pages: number;
            }>
        >('/products/manager/list', { params });
    }

    getPriceHistory(id: number): Promise<AxiosResponse<ApiResponse<any[]>>> {
        return this.apiClient.get<ApiResponse<any[]>>(`/products/${id}/price-history`);
    }
}