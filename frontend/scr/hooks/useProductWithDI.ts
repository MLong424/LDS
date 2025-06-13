// Enhanced useProduct hook with dependency injection
import { useState, useCallback } from 'react';
import { Product, ProductSearchParams } from '@cusTypes/products';
import { useBaseHook } from './BaseHook';
import { IProductService } from '../api/interfaces/IApiService';
import { useServiceDependency } from './DependencyProvider';

export const useProductWithDI = (productService?: IProductService) => {
    const { loading, error, executeRequest, clearError } = useBaseHook();
    const [products, setProducts] = useState<Product[]>([]);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    
    // Use injected service or get from dependency context
    const defaultService = useServiceDependency('productService');
    const service = productService || defaultService;

    const getAllProducts = useCallback(async (filters?: ProductSearchParams) => {
        return executeRequest(
            () => service.getAllProducts(filters),
            (response) => {
                const productList = response.data.data || [];
                setProducts(productList);
                return response.data;
            },
            'An error occurred while fetching products'
        );
    }, [executeRequest, service]);

    const getProduct = useCallback(async (id: number) => {
        return executeRequest(
            () => service.getProduct(id),
            (response) => {
                const product = response.data.data || null;
                setCurrentProduct(product);
                return response.data;
            },
            'An error occurred while fetching product details'
        );
    }, [executeRequest, service]);

    const createProduct = useCallback(async (productData: Partial<Product>) => {
        return executeRequest(
            () => service.createProduct(productData),
            (response) => {
                // Refresh products list
                getAllProducts();
                return response.data;
            },
            'An error occurred while creating product'
        );
    }, [executeRequest, service, getAllProducts]);

    const updateProduct = useCallback(async (id: number, productData: Partial<Product>) => {
        return executeRequest(
            () => service.updateProduct(id, productData),
            (response) => {
                // Refresh products list and current product if it's the same
                getAllProducts();
                if (currentProduct?.id === id) {
                    getProduct(id);
                }
                return response.data;
            },
            'An error occurred while updating product'
        );
    }, [executeRequest, service, getAllProducts, currentProduct, getProduct]);

    const deleteProduct = useCallback(async (id: number) => {
        return executeRequest(
            () => service.deleteProduct(id),
            (response) => {
                // Remove from products list and clear current if it's the same
                setProducts(prev => prev.filter(p => p.id !== id));
                if (currentProduct?.id === id) {
                    setCurrentProduct(null);
                }
                return response.data;
            },
            'An error occurred while deleting product'
        );
    }, [executeRequest, service, currentProduct]);

    return {
        products,
        currentProduct,
        loading,
        error,
        clearError,
        getAllProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
    };
};