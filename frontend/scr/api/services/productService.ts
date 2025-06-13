// src/api/services/productService.ts
import { axiosInstance } from '../config';
import { ProductSearchParams, ProductManagerParams, Product, ProductPriceHistory } from '@cusTypes/products';
import { ApiResponse } from '@cusTypes/common';

const productService = {
    // Public endpoints
    getRandomProducts: (pageSize = 20) =>
        axiosInstance.get<ApiResponse<Product[]>>('/products/random', {
            params: { page_size: pageSize },
        }),

    searchProducts: (params: ProductSearchParams) =>
        axiosInstance.get<
            ApiResponse<{
                products: Product[];
                total_count: number;
                page: number;
                page_size: number;
                total_pages: number;
            }>
        >('/products/search', { params }),

    getProductDetails: (id: number) => axiosInstance.get<ApiResponse<any>>(`/products/${id}`),

    checkRushEligibility: (id: number) =>
        axiosInstance.get<
            ApiResponse<{
                product_id: number;
                is_eligible: boolean;
            }>
        >(`/products/${id}/rush-eligibility`),

    // Product Manager endpoints (authenticated)
    getProductList: (params: ProductManagerParams) =>
        axiosInstance.get<
            ApiResponse<{
                products: Product[];
                total_count: number;
                page: number;
                page_size: number;
                total_pages: number;
            }>
        >('/products/manager/list', { params }),

    getPriceHistory: (id: number) =>
        axiosInstance.get<ApiResponse<ProductPriceHistory[]>>(`/products/${id}/price-history`),

    createProduct: (productData: Partial<Product>) =>
        axiosInstance.post<
            ApiResponse<{
                product_id: number;
            }>
        >('/products', productData),

    updateProduct: (id: number, productData: Partial<Product>) =>
        axiosInstance.put<ApiResponse>(`/products/${id}`, productData),
};

export default productService;
