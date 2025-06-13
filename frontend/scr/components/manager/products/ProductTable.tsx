import React from 'react';
import { Package, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { ProductTableProps } from '@/components/common';
import { ProductRow } from './ProductRow';

export const ProductTable: React.FC<ProductTableProps> = ({
    products,
    pagination,
    filters,
    onEdit,
    onView,
    onPageChange,
    onAddProduct,
}) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Products</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        {pagination && (
                            <>
                                Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
                                {Math.min(pagination.page * pagination.page_size, pagination.total_count)} of{' '}
                                {pagination.total_count} products
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {products.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No products found</h3>
                        <p className="text-muted-foreground mb-4">
                            {filters.title || filters.media_type || filters.min_price || filters.max_price
                                ? 'Try adjusting your filters or search terms.'
                                : 'Get started by adding your first product.'}
                        </p>
                        {!(filters.title || filters.media_type || filters.min_price || filters.max_price) && (
                            <Button onClick={onAddProduct}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Product
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <ProductRow
                                            key={product.product_id}
                                            product={product}
                                            onEdit={onEdit}
                                            onView={onView}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.total_pages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {pagination.total_pages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.total_pages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
