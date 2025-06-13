import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuickStatsProps } from '@/components/common';

export const QuickStats: React.FC<QuickStatsProps> = ({ product, stockStatus }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        
                        <div>
                            <div className="text-2xl font-bold">{product.current_price}</div>
                            <div className="text-sm text-muted-foreground">Current Price</div>
                            {product.base_value !== product.current_price && (
                                <div className="text-xs text-muted-foreground line-through">
                                    Base: {product.base_value.toFixed(0)} VND
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                            <div className="text-2xl font-bold">{product.stock}</div>
                            <div className="text-sm text-muted-foreground">In Stock</div>
                            <Badge variant={stockStatus.variant} className="mt-1">
                                {stockStatus.icon}
                                <span className="ml-1">{stockStatus.label}</span>
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                            {product.media_type}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <div>
                            <div className="text-sm font-medium">Last Updated</div>
                            <div className="text-sm text-muted-foreground">
                                {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
