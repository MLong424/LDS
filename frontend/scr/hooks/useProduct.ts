// src/hooks/useProduct.ts
import { useState, useCallback } from 'react';
import { ProductSearchParams, ProductManagerParams, Product, ProductPriceHistory } from '@cusTypes/products';
import { useBaseHook } from './BaseHook';
import { IProductService } from '../api/interfaces/IApiService';
import { serviceFactory } from '../api/index';

export const useProduct = (injectedProductService?: IProductService) => {
    const { loading, error, executeRequest, clearError } = useBaseHook();
    const [products, setProducts] = useState<Product[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [priceHistory, setPriceHistory] = useState<ProductPriceHistory[]>([]);
    const [pagination, setPagination] = useState<{
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
    } | null>(null);

    // Use injected service, factory service, or legacy service as fallback
    const service = injectedProductService || serviceFactory.createProductService();

    // Public endpoints
    const getRandomProducts = useCallback(async (pageSize = 20) => {
        return executeRequest(
            () => service.getRandomProducts(pageSize),
            (response) => {
                setProducts(response.data.data || []);
                return response.data;
            },
            'An error occurred while fetching random products'
        );
    }, [executeRequest, service]);

    const searchProducts = useCallback(async (params: ProductSearchParams) => {
        return executeRequest(
            () => service.searchProducts(params),
            (response) => {
                if (!response.data.data) {
                    throw new Error('No products found for the given search criteria.');
                } else {
                    setProducts(response.data.data.products);
                    setPagination({
                        total_count: response.data.data.total_count,
                        page: response.data.data.page,
                        page_size: response.data.data.page_size,
                        total_pages: response.data.data.total_pages,
                    });
                    return response.data;
                }
            },
            'An error occurred while searching products'
        );
    }, [executeRequest, service]);

    const getProductDetails = useCallback(async (id: number) => {
        return executeRequest(
            () => service.getProductDetails(id),
            (response) => {
                setProduct(response.data.data ?? null);
                return response.data;
            },
            'An error occurred while fetching product details'
        );
    }, [executeRequest, service]);

    const checkRushEligibility = useCallback(async (id: number) => {
        return executeRequest(
            () => service.checkRushEligibility(id),
            (response) => response.data,
            'An error occurred while checking rush eligibility'
        );
    }, [executeRequest, service]);

    // Product Manager endpoints (authenticated)
    const getProductList = useCallback(async (params: ProductManagerParams) => {
        return executeRequest(
            () => service.getProductList(params),
            (response) => {
                if (!response.data.data) {
                    throw new Error('No products found for the given search criteria.');
                } else {
                    setProducts(response.data.data.products);
                    setPagination({
                        total_count: response.data.data.total_count,
                        page: response.data.data.page,
                        page_size: response.data.data.page_size,
                        total_pages: response.data.data.total_pages,
                    });
                    return response.data;
                }
            },
            'An error occurred while fetching product list'
        );
    }, [executeRequest, service]);

    const getPriceHistory = useCallback(async (id: number) => {
        return executeRequest(
            () => service.getPriceHistory(id),
            (response) => {
                setPriceHistory(response.data.data ?? []);
                return response.data;
            },
            'An error occurred while fetching price history'
        );
    }, [executeRequest, service]);

    const createProduct = useCallback(async (productData: Partial<Product>) => {
        return executeRequest(
            () => service.createProduct(productData),
            (response) => response.data,
            'An error occurred while creating product'
        );
    }, [executeRequest, service]);

    const updateProduct = useCallback(async (id: number, productData: Partial<Product>) => {
        return executeRequest(
            () => service.updateProduct(id, productData),
            (response) => response.data,
            'An error occurred while updating product'
        );
    }, [executeRequest, service]);

    return {
        products,
        product,
        priceHistory,
        pagination,
        loading,
        error,
        clearError,
        getRandomProducts,
        searchProducts,
        getProductDetails,
        checkRushEligibility,
        getProductList,
        getPriceHistory,
        createProduct,
        updateProduct,
    };
};
