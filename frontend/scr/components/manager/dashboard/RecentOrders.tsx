import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ArrowRight, Eye, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PendingOrder } from '@/types';
import { LoadingSpinner } from '@/components/common';
import { formatCurrency } from '@/utils/formatters';
import { RecentOrdersProps } from '@components/common';
import React from 'react';

const RecentOrders: React.FC<RecentOrdersProps> = ({ ordersLoading, pendingOrders }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders requiring attention</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link to="/manager/orders">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {ordersLoading ? (
                    <div className="flex justify-center py-4">
                        <LoadingSpinner message="Loading orders..." />
                    </div>
                ) : pendingOrders && pendingOrders.length > 0 ? (
                    <div className="space-y-4">
                        {pendingOrders.slice(0, 5).map((order: PendingOrder) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{order.id}</span>
                                        <Badge variant={order.has_sufficient_stock ? 'secondary' : 'destructive'}>
                                            {order.has_sufficient_stock ? 'Ready' : 'Stock Issue'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{order.recipient_name}</p>
                                    <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to={`/manager/orders/${order.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No pending orders</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
export default RecentOrders;
