// src/components/product/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@cusTypes/products';
import { useCartContext } from '@contexts/CartContext';
import { getMediaIcon } from '@/utils/mediaIcons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';

interface ProductCardProps {
    product: Product;
    variant?: 'default' | 'horizontal';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'default' }) => {
    const { addItem, loading } = useCartContext();
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await addItem(product.product_id, 1);
        } catch (error) {
            console.error('Failed to add item to cart:', error);
        }
    };

    // Get author/artist info based on media type
    const getCreators = () => {
        if (product.book?.authors?.length) {
            return `By ${product.book.authors.join(', ')}`;
        }
        if (product.cd?.artists?.length) {
            return `By ${product.cd.artists.join(', ')}`;
        }
        if (product.lp_record?.artists?.length) {
            return `By ${product.lp_record.artists.join(', ')}`;
        }
        if (product.dvd?.director) {
            return `Directed by ${product.dvd.director}`;
        }
        return '';
    };

    // Determine stock status label and color
    const getStockStatus = () => {
        const stock = product.stock;
        if (stock === 0) {
            return { label: 'Out of Stock', variant: 'destructive' as const };
        } else if (stock < 5) {
            return { label: 'Low Stock', variant: 'secondary' as const };
        } else {
            return { label: 'In Stock', variant: 'outline' as const };
        }
    };

    const stockStatus = getStockStatus();

    // For the horizontal variant
    if (variant === 'horizontal') {
        return (
            <Card className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/3 bg-muted flex items-center justify-center p-4">
                        <div className="aspect-square w-full max-w-[180px] flex items-center justify-center bg-background/80 rounded-md">
                            {getMediaIcon(product.media_type)}
                            <span className="sr-only">{product.title}</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full sm:w-2/3">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                    {product.media_type}
                                </Badge>
                                <Badge variant={stockStatus.variant} className="text-xs">
                                    {stockStatus.label}
                                </Badge>
                            </div>
                            <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                            <CardDescription className="line-clamp-1">{getCreators()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold">{product.current_price} VND</p>
                            {product.product_description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {product.product_description}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                            <Button variant="outline" asChild>
                                <Link to={`/product/${product.product_id}`}>View Details</Link>
                            </Button>
                            <div className="flex gap-2">
                                
                                <Button size="icon" onClick={handleAddToCart} disabled={loading || product.stock === 0}>
                                    <ShoppingCart className="h-4 w-4" />
                                    <span className="sr-only">Add to Cart</span>
                                </Button>
                            </div>
                        </CardFooter>
                    </div>
                </div>
            </Card>
        );
    }

    // Default vertical card
    return (
        <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
            <Link to={`/product/${product.product_id}`} className="flex flex-col h-full">
                <div className="aspect-square w-full bg-muted flex items-center justify-center p-4">
                    <div className="aspect-square w-full max-w-[180px] flex items-center justify-center bg-background/80 rounded-md">
                        {getMediaIcon(product.media_type)}
                        <span className="sr-only">{product.title}</span>
                    </div>
                </div>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                            {product.media_type}
                        </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-1">{product.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{getCreators()}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 pt-0 flex-grow">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">{product.current_price} VND</p>
                        <Badge variant={stockStatus.variant} className="text-xs">
                            {stockStatus.label}
                        </Badge>
                    </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2 justify-between">
                    
                    <Button
                        size="sm"
                        className="w-full"
                        onClick={handleAddToCart}
                        disabled={loading || product.stock === 0}
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                    </Button>
                </CardFooter>
            </Link>
        </Card>
    );
};

export default ProductCard;
