import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";
import { StatsCardProps } from "@/components/common";

export const StatsCards: React.FC<StatsCardProps> = ({ pagination, products }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold">{pagination?.total_count || 0}</div>
                                <div className="text-sm text-muted-foreground">Total Products</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <div>
                                <div className="text-2xl font-bold">
                                    {products.filter((p) => p.stock <= 10 && p.stock > 0).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Low Stock</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-red-600" />
                            <div>
                                <div className="text-2xl font-bold">{products.filter((p) => p.stock === 0).length}</div>
                                <div className="text-sm text-muted-foreground">Out of Stock</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            
                            <div>
                                <div className="text-2xl font-bold">
                                    {products.reduce((sum, p) => sum + p.current_price * p.stock, 0)} VND
                                </div>
                                <div className="text-sm text-muted-foreground">Total Value</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
    )
}