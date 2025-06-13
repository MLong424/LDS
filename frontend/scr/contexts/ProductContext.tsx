// src/contexts/ProductContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useProduct } from '../hooks/useProduct';
import { PaginationType, Product, ProductPriceHistory, ProductSearchParams, ProductManagerParams } from '@/types';

interface ProductContextType {
    products: Product[];
    product: Product | null;
    priceHistory: ProductPriceHistory[];
    pagination: PaginationType | null;
    loading: boolean;
    error: string | null;
    getRandomProducts: (pageSize?: number) => Promise<any>;
    searchProducts: (params: ProductSearchParams) => Promise<any>;
    getProductDetails: (id: number) => Promise<any>;
    checkRushEligibility: (id: number) => Promise<any>;
    getProductList: (params: ProductManagerParams) => Promise<any>;
    getPriceHistory: (id: number) => Promise<any>;
    createProduct: (productData: Partial<Product>) => Promise<any>;
    updateProduct: (id: number, productData: Partial<Product>) => Promise<any>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const productHook = useProduct();

    return <ProductContext.Provider value={productHook}>{children}</ProductContext.Provider>;
};

export const useProductContext = (): ProductContextType => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
};
