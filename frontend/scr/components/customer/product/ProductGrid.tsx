// src/components/product/ProductGrid.tsx
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@cusTypes/products';
import { LoadingSpinner } from '@components/common';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    pagination?: {
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
    } | null;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    layout?: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    loading = false,
    error = null,
    emptyMessage = 'No products found.',
    pagination = null,
    onPageChange,
    onPageSizeChange,
    layout = 'grid',
}) => {
    const handlePageChange = (page: number) => {
        if (onPageChange) {
            window.scrollTo(0, 0);
            onPageChange(page);
        }
    };

    const handlePageSizeChange = (value: string) => {
        if (onPageSizeChange) {
            onPageSizeChange(parseInt(value));
        }
    };

    // Create pagination links
    const renderPaginationLinks = () => {
        if (!pagination || pagination.total_pages <= 1) return null;

        const currentPage = pagination.page;
        const totalPages = pagination.total_pages;

        const paginationItems = [];

        // Previous button
        paginationItems.push(
            <PaginationItem key="prev">
                <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
            </PaginationItem>
        );

        // First page
        paginationItems.push(
            <PaginationItem key={1}>
                <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1}>
                    1
                </PaginationLink>
            </PaginationItem>
        );

        // Ellipsis after first page
        if (currentPage > 3) {
            paginationItems.push(
                <PaginationItem key="ellipsis1">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (i === 1 || i === totalPages) continue; // Skip first and last pages as they're handled separately

            paginationItems.push(
                <PaginationItem key={i}>
                    <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Ellipsis before last page
        if (currentPage < totalPages - 2) {
            paginationItems.push(
                <PaginationItem key="ellipsis2">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Last page (if not the first page)
        if (totalPages > 1) {
            paginationItems.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages}>
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Next button
        paginationItems.push(
            <PaginationItem key="next">
                <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
            </PaginationItem>
        );

        return paginationItems;
    };

    if (loading) {
        return <LoadingSpinner fullPage message="Loading products..." />;
    }

    if (error) {
        return <div className="p-4 text-center text-destructive">{error}</div>;
    }

    if (!products.length) {
        return <div className="p-4 text-center text-muted-foreground">{emptyMessage}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Products Header - Showing count and page controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    {pagination && (
                        <p className="text-sm text-muted-foreground">
                            Showing {(pagination.page - 1) * pagination.page_size + 1}-
                            {Math.min(pagination.page * pagination.page_size, pagination.total_count)} of{' '}
                            {pagination.total_count} products
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {onPageSizeChange && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Show:</span>
                            <Select value={String(pagination?.page_size || 20)} onValueChange={handlePageSizeChange}>
                                <SelectTrigger className="w-24">
                                    <SelectValue placeholder="20" />
                                </SelectTrigger>
                                <SelectContent className="bg-amber-200">
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid or List */}
            {layout === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.product_id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {products.map((product) => (
                        <ProductCard key={product.product_id} product={product} variant="horizontal" />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.total_pages > 1 && (
                <Pagination className="mt-8">
                    <PaginationContent>{renderPaginationLinks()}</PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default ProductGrid;
