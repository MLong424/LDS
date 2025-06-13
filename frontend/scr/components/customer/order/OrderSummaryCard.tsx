// src/components/order/OrderSummaryCard.tsx
import React from 'react';
import { Order } from '@cusTypes/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderSummaryCardProps {
    order: Order;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Order Summary</span>
                    <OrderStatusBadge status={order.order_status} />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Order ID:</span>
                            <span className="font-medium">{order.order_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date Placed:</span>
                            <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Payment Status:</span>
                            <OrderStatusBadge status={order.payment_status} />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>{order.products_total} VND</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">VAT:</span>
                            <span>{order.vat_amount} VND</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Delivery Fee:</span>
                            <span>{order.delivery_fee} VND</span>
                        </div>
                        {order.delivery_type === 'RUSH' && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Rush Delivery Fee:</span>
                                <span>{order.rush_delivery_fee} VND</span>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{order.total_amount} VND</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderSummaryCard;