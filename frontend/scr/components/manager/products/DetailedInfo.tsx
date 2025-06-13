import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Ruler, Weight, MapPin, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { getSpecificDetails } from './utils';
import { DetailedInfoProps } from '@/components/common';

export const DetailedInfo: React.FC<DetailedInfoProps> = ({ product, priceHistory, stockStatus }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('details');
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
                <TabsTrigger value="details">Product Details</TabsTrigger>
                <TabsTrigger value="pricing">Price History</TabsTrigger>
                <TabsTrigger value="inventory">Inventory Info</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">Barcode</h4>
                                <p className="text-sm text-muted-foreground font-mono">{product.barcode}</p>
                            </div>
                            {product.dimensions && (
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Ruler className="h-4 w-4" />
                                        Dimensions
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{product.dimensions}</p>
                                </div>
                            )}
                            {product.weight && (
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Weight className="h-4 w-4" />
                                        Weight
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{product.weight} kg</p>
                                </div>
                            )}
                            {product.warehouse_entry_date && (
                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Warehouse Entry
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(product.warehouse_entry_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {product.product_description && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {product.product_description}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{product.media_type} Specific Details</CardTitle>
                    </CardHeader>
                    <CardContent>{getSpecificDetails(product)}</CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Price History
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/manager/catalog/${product.product_id}/price-history`)}
                            >
                                View Full History
                            </Button>
                        </div>
                        <CardDescription>Recent price changes for this product</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {priceHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No price history</h3>
                                <p className="text-muted-foreground">This product hasn't had any price changes yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {priceHistory.slice(0, 5).map((change) => (
                                    <div
                                        key={change.price_change_id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {change.old_price} → {change.new_price}
                                                </span>
                                                <Badge
                                                    variant={
                                                        change.new_price > change.old_price ? 'default' : 'secondary'
                                                    }
                                                >
                                                    {change.new_price > change.old_price ? '+' : ''}
                                                    {(change.new_price - change.old_price)}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Changed by {change.changed_by}
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(change.changed_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                                {priceHistory.length > 5 && (
                                    <div className="text-center">
                                        <Link
                                            to={`/manager/catalog/${product.product_id}/price-history`}
                                            className="text-primary hover:underline text-sm"
                                        >
                                            View {priceHistory.length - 5} more changes
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Inventory Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Current Stock Level</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold">{product.stock}</span>
                                        <Badge variant={stockStatus.variant}>
                                            {stockStatus.icon}
                                            <span className="ml-1">{stockStatus.label}</span>
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Total Value</h4>
                                    <p className="text-lg font-semibold text-green-600">
                                        {(product.current_price * product.stock)} VND
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Warehouse Entry Date</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {product.warehouse_entry_date
                                            ? new Date(product.warehouse_entry_date).toLocaleDateString()
                                            : 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Created</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {product.created_at
                                            ? new Date(product.created_at).toLocaleDateString()
                                            : 'Not available'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {product.stock <= 10 && product.stock > 0 && (
                            <Alert className="mt-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    This product has low stock. Consider restocking soon to avoid stockouts.
                                </AlertDescription>
                            </Alert>
                        )}

                        {product.stock === 0 && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    This product is out of stock. Update inventory levels or remove from active
                                    listings.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};
