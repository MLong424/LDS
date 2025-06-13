// src/pages/manager/Products/ProductList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '@contexts/ProductContext';
import { ProductManagerParams } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { LoadingSpinner } from '@/components/common';
import { ProductFilters, ProductListHeader, StatsCards, ProductTable } from '@/components/manager/products';

const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const { products, pagination, loading, error, getProductList } = useProductContext();

    const [filters, setFilters] = useState<ProductManagerParams>({
        page: 1,
        page_size: 20,
        manager_sort_by: 'id',
        sort_order: 'asc',
        include_out_of_stock: true,
    });

    // Load products on component mount and when filters change
    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadProducts = async () => {
        try {
            await getProductList(filters);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const handleFiltersChange = (newFilters: ProductManagerParams) => {
        setFilters({ ...newFilters, page: 1 }); // Reset to first page when filters change
    };

    const handleResetFilters = () => {
        setFilters({
            page: 1,
            page_size: 20,
            manager_sort_by: 'id',
            sort_order: 'asc',
            include_out_of_stock: true,
        });
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleEdit = (productId: number) => {
        navigate(`/manager/catalog/edit/${productId}`);
    };

    const handleView = (productId: number) => {
        navigate(`/manager/catalog/${productId}/details`);
    };

    const handleAddProduct = () => {
        navigate('/manager/catalog/add');
    };

    if (loading && !products.length) {
        return <LoadingSpinner fullPage message="Loading products..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <ProductListHeader onAddProduct={handleAddProduct} />

            {/* Stats Cards */}
            <StatsCards pagination={pagination} products={products} />

            {/* Filters */}
            <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} onReset={handleResetFilters} />

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Products Table */}
            <ProductTable
                products={products}
                pagination={pagination}
                filters={filters}
                onView={handleView}
                onEdit={handleEdit}
                onPageChange={handlePageChange}
                onAddProduct={handleAddProduct}
            />

            {loading && products.length > 0 && (
                <div className="flex justify-center py-4">
                    <LoadingSpinner message="Loading..." />
                </div>
            )}
        </div>
    );
};

export default ProductList;
