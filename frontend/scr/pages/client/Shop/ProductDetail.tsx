// src/pages/client/Shop/ProductDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductContext } from '@contexts/ProductContext';
import { useCartContext } from '@contexts/CartContext';
import { Card } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Separator } from '@components/ui/separator';
import { Alert, AlertDescription } from '@components/ui/alert';
import { LoadingSpinner } from '@components/common';
import { getMediaIcon } from '@/utils/mediaIcons';

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getProductDetails, product, loading, error } = useProductContext();
    const { addItem, loading: cartLoading } = useCartContext();
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            getProductDetails(Number(id));
        }
    }, [id, getProductDetails]);    

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0 && product && value <= product.stock) {
            setQuantity(value);
        }
    };

    const handleAddToCart = async () => {
        if (product) {
            try {
                await addItem(product.id, quantity);
            } catch (error) {
                console.error('Failed to add to cart:', error);
            }
        }
    };

    // Get stock status
    const getStockStatus = () => {
        if (!product) return { label: 'Unknown', variant: 'outline' as const };

        if (product.stock <= 0) {
            return { label: 'Out of Stock', variant: 'destructive' as const };
        } else if (product.stock < 5) {
            return { label: 'Low Stock', variant: 'secondary' as const };
        } else {
            return { label: 'In Stock', variant: 'outline' as const };
        }
    };

    const stockStatus = getStockStatus();

    // Format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid date';
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="Loading product details..." />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!product) {
        return (
            <Alert>
                <AlertDescription>Product not found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Product Image Placeholder */}
                <Card className="md:col-span-1 bg-muted/50 flex items-center justify-center p-8 aspect-square">
                    <div className="flex flex-col items-center justify-center text-primary">
                        {getMediaIcon(product.media_type)}
                        <span className="mt-4 text-lg font-medium">{product.media_type}</span>
                    </div>
                </Card>

                {/* Product Details */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{product.media_type}</Badge>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </div>
                        <h1 className="text-3xl font-bold">{product.title}</h1>

                        {/* Author/Artist info */}
                        {product.book?.authors && (
                            <p className="text-muted-foreground mt-2">By {product.book.authors.join(', ')}</p>
                        )}
                        {product.cd?.artists && (
                            <p className="text-muted-foreground mt-2">By {product.cd.artists.join(', ')}</p>
                        )}
                        {product.lp_record?.artists && (
                            <p className="text-muted-foreground mt-2">By {product.lp_record.artists.join(', ')}</p>
                        )}
                        {product.dvd?.director && (
                            <p className="text-muted-foreground mt-2">Directed by {product.dvd.director}</p>
                        )}
                    </div>

                    {/* Price and Purchase */}
                    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-2xl font-bold">{product.current_price} VND</span>
                                {product.base_value !== product.current_price && (
                                    <span className="text-muted-foreground line-through ml-2">
                                        {product.base_value.toFixed(0)} VND
                                    </span>
                                )}
                            </div>
                            <div>
                                <Badge variant={stockStatus.variant}>{product.stock} in stock</Badge>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-24">
                                <label htmlFor="quantity" className="text-sm font-medium block mb-1">
                                    Quantity
                                </label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max={product.stock}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    disabled={product.stock <= 0}
                                />
                            </div>
                            <div className="flex-1 flex gap-2">
                                <Button
                                    className="flex-1"
                                    onClick={handleAddToCart}
                                    disabled={cartLoading || product.stock <= 0}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                                </Button>
                                
                            </div>
                        </div>
                    </div>

                    {/* Product Description */}
                    {product.product_description && (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Description</h2>
                            <p className="text-muted-foreground">{product.product_description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Specifications */}
            <Tabs defaultValue="details" className="mt-8">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Product Details</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="p-4 border rounded-md mt-2">
                    <div className="space-y-4">
                        {/* Book Details */}
                        {product.media_type === 'BOOK' && product.book && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Authors</span>
                                    <span>{product.book.authors?.join(', ') || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Publisher</span>
                                    <span>{product.book.publisher || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Publication Date</span>
                                    <span>{formatDate(product.book.publication_date)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Pages</span>
                                    <span>{product.book.pages || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Cover Type</span>
                                    <span>{product.book.cover_type || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Language</span>
                                    <span>{product.book.language || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Genre</span>
                                    <span>{product.book.genre || 'Not specified'}</span>
                                </div>
                            </div>
                        )}

                        {/* CD Details */}
                        {product.media_type === 'CD' && product.cd && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Artists</span>
                                    <span>{product.cd.artists?.join(', ') || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Record Label</span>
                                    <span>{product.cd.record_label || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Release Date</span>
                                    <span>{formatDate(product.cd.release_date)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Genre</span>
                                    <span>{product.cd.genre || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Number of Tracks</span>
                                    <span>{product.cd.tracklist?.length || 'Not specified'}</span>
                                </div>
                            </div>
                        )}

                        {/* LP Record Details */}
                        {product.media_type === 'LP_RECORD' && product.lp_record && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Artists</span>
                                    <span>{product.lp_record.artists?.join(', ') || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Record Label</span>
                                    <span>{product.lp_record.record_label || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Release Date</span>
                                    <span>{formatDate(product.lp_record.release_date)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Genre</span>
                                    <span>{product.lp_record.genre || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Number of Tracks</span>
                                    <span>{product.lp_record.tracklist?.length || 'Not specified'}</span>
                                </div>
                            </div>
                        )}

                        {/* DVD Details */}
                        {product.media_type === 'DVD' && product.dvd && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Director</span>
                                    <span>{product.dvd.director || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Studio</span>
                                    <span>{product.dvd.studio || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Release Date</span>
                                    <span>{formatDate(product.dvd.release_date)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Runtime</span>
                                    <span>
                                        {product.dvd.runtime ? `${product.dvd.runtime} minutes` : 'Not specified'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Disc Type</span>
                                    <span>{product.dvd.disc_type?.replace('_', ' ') || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Language</span>
                                    <span>{product.dvd.language || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Subtitles</span>
                                    <span>{product.dvd.subtitles?.join(', ') || 'None'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">Genre</span>
                                    <span>{product.dvd.genre || 'Not specified'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="specifications" className="p-4 border rounded-md mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Barcode</span>
                            <span>{product.barcode || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Dimensions</span>
                            <span>{product.dimensions || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Weight</span>
                            <span>{product.weight ? `${product.weight} kg` : 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Warehouse Entry Date</span>
                            <span>{formatDate(product.warehouse_entry_date)}</span>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="shipping" className="p-4 border rounded-md mt-2">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Standard Delivery</h3>
                            <p>Delivery within 3-5 business days.</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="text-lg font-medium mb-2">Rush Delivery</h3>
                            <p>Next-day delivery available for eligible products.</p>
                            {product && (
                                <Badge variant={product.stock > 0 ? 'default' : 'secondary'}>
                                    {product.stock > 0
                                        ? product.stock > 0
                                            ? 'Rush Eligible'
                                            : 'Not Eligible for Rush Delivery'
                                        : 'Out of Stock'}
                                </Badge>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProductDetail;
