// src/components/product/ProductDetail.tsx
import React, { useState } from 'react';
import { Product } from '@cusTypes/products';
import { MediaIcon } from '@/components/common';
import { useCartContext } from '@contexts/CartContext';
import { formatDate } from '@utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface ProductDetailProps {
    product: Product;
    loading?: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, loading = false }) => {
    const [quantity, setQuantity] = useState(1);
    const { addItem, loading: cartLoading } = useCartContext();

    // Format the price with locale
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const handleAddToCart = async () => {
        try {
            await addItem(product.id, quantity);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    // Helper function to determine media type badge variant
    const getMediaTypeBadgeVariant = (mediaType: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (mediaType) {
            case 'BOOK':
                return 'default';
            case 'CD':
                return 'secondary';
            case 'LP_RECORD':
                return 'outline';
            case 'DVD':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    // Get stock status and badge variant
    const getStockStatus = () => {
        if (product.stock <= 0) {
            return { text: 'Out of Stock', variant: 'destructive' as const };
        } else if (product.stock < 10) {
            return { text: 'Low Stock', variant: 'outline' as const };
        } else {
            return { text: 'In Stock', variant: 'default' as const };
        }
    };

    const stockStatus = getStockStatus();

    // Get specific product details based on media type
    const getSpecificDetails = () => {
        switch (product.media_type) {
            case 'BOOK':
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Book Details</h3>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium w-1/3">Authors</TableCell>
                                    <TableCell>
                                        {product.book?.authors?.join(', ') || 'Unknown'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Publisher</TableCell>
                                    <TableCell>{product.book?.publisher || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Publication Date</TableCell>
                                    <TableCell>
                                        {product.book?.publication_date
                                            ? formatDate(product.book.publication_date)
                                            : 'Not specified'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Pages</TableCell>
                                    <TableCell>{product.book?.pages || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Cover Type</TableCell>
                                    <TableCell>{product.book?.cover_type || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Language</TableCell>
                                    <TableCell>{product.book?.language || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Genre</TableCell>
                                    <TableCell>{product.book?.genre || 'Not specified'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                );
            case 'CD':
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">CD Details</h3>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium w-1/3">Artists</TableCell>
                                    <TableCell>
                                        {product.cd?.artists?.join(', ') || 'Unknown'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Label</TableCell>
                                    <TableCell>{product.cd?.record_label || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Release Date</TableCell>
                                    <TableCell>
                                        {product.cd?.release_date
                                            ? formatDate(product.cd.release_date)
                                            : 'Not specified'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Genre</TableCell>
                                    <TableCell>{product.cd?.genre || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Number of Tracks</TableCell>
                                    <TableCell>{product.cd?.tracklist.length || 'Not specified'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                );
            case 'LP_RECORD':
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Vinyl Record Details</h3>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium w-1/3">Artists</TableCell>
                                    <TableCell>
                                        {product.lp_record?.artists?.join(', ') || 'Unknown'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Label</TableCell>
                                    <TableCell>{product.lp_record?.record_label || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Release Date</TableCell>
                                    <TableCell>
                                        {product.lp_record?.release_date
                                            ? formatDate(product.lp_record.release_date)
                                            : 'Not specified'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Genre</TableCell>
                                    <TableCell>{product.lp_record?.genre || 'Not specified'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                );
            case 'DVD':
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">DVD Details</h3>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium w-1/3">Studio</TableCell>
                                    <TableCell>
                                        {product.dvd?.studio || 'Unknown'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Director</TableCell>
                                    <TableCell>
                                        {product.dvd?.director || 'Not specified'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Release Date</TableCell>
                                    <TableCell>
                                        {product.dvd?.release_date
                                            ? formatDate(product.dvd.release_date)
                                            : 'Not specified'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Genre</TableCell>
                                    <TableCell>{product.dvd?.genre || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Runtime</TableCell>
                                    <TableCell>{product.dvd?.runtime ? `${product.dvd.runtime} minutes` : 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Language</TableCell>
                                    <TableCell>{product.dvd?.language || 'Not specified'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-64">Loading product details...</div>;
    }

    if (!product) {
        return <div className="flex items-center justify-center min-h-64">Product not found</div>;
    }

    return (
        <div className="product-detail max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                    <Card className="h-full">
                        <CardContent className="flex items-center justify-center p-8 h-64 md:h-full">
                            <MediaIcon
                                mediaType={product.media_type}
                                size={150}
                                color="currentColor"
                            />
                        </CardContent>
                    </Card>
                </div>
                
                <div className="md:col-span-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-3">{product.title}</h1>
                            <div className="flex gap-2 mb-4">
                                <Badge variant={getMediaTypeBadgeVariant(product.media_type)}>
                                    {product.media_type.replace('_', ' ')}
                                </Badge>
                                <Badge variant={stockStatus.variant}>
                                    {stockStatus.text}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{formatPrice(product.current_price)}</div>
                            {product.base_value !== product.current_price && (
                                <div className="text-muted-foreground line-through">
                                    {formatPrice(product.base_value)}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-muted-foreground mb-6">
                        {product.product_description || 'No description available for this product.'}
                    </p>

                    <div className="flex items-end gap-4 mb-6">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                max={product.stock}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                disabled={product.stock <= 0}
                                className="w-20"
                            />
                        </div>
                        <Button
                            size="lg"
                            onClick={handleAddToCart}
                            disabled={cartLoading || product.stock <= 0}
                            className="flex-1 md:flex-none md:min-w-48"
                        >
                            {cartLoading ? 'Adding...' : 'Add to Cart'}
                        </Button>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Product Information</h3>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium w-1/3">Barcode</TableCell>
                                    <TableCell>{product.barcode || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Stock</TableCell>
                                    <TableCell>{product.stock} units</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Dimensions</TableCell>
                                    <TableCell>{product.dimensions || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Weight</TableCell>
                                    <TableCell>{product.weight ? `${product.weight} kg` : 'Not specified'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {getSpecificDetails()}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
