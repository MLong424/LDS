// src/components/order/ShippingDetailsCard.tsx
import React from 'react';
import { Order } from '@cusTypes/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { MapPin, Phone, Mail, User, Zap, Truck } from 'lucide-react';

interface ShippingDetailsCardProps {
    order: Order;
}

const ShippingDetailsCard: React.FC<ShippingDetailsCardProps> = ({ order }) => {
    const formatDeliveryTime = (dateString?: string) => {
        if (!dateString) return null;

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Recipient</h3>
                        <div className="grid gap-1">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{order.recipient_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{order.recipient_phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{order.recipient_email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Delivery Address</h3>
                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p>{order.delivery_address}</p>
                                <p>{order.delivery_province}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Delivery Method</h3>
                        <div className="flex items-center gap-2 text-sm">
                            {order.delivery_type === 'RUSH' ? (
                                <Zap className="h-4 w-4 text-amber-500" />
                            ) : (
                                <Truck className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{order.delivery_type === 'RUSH' ? 'Rush Delivery' : 'Standard Delivery'}</span>
                        </div>

                        {order.delivery_type === 'RUSH' && order.rush_delivery_time && (
                            <div className="text-sm ml-6">
                                <p>Requested Time: {formatDeliveryTime(order.rush_delivery_time)}</p>
                                {order.rush_delivery_instructions && (
                                    <p className="mt-1">Instructions: {order.rush_delivery_instructions}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ShippingDetailsCard;
