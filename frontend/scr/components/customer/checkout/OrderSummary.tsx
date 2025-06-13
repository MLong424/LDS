// src/components/checkout/OrderSummary.tsx
import React from 'react';
import { Cart } from '@cusTypes/cart';
import { DeliveryFeeResult } from '@cusTypes/cart';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import { PackageIcon, TruckIcon } from 'lucide-react';

interface OrderSummaryProps {
    cart: Cart;
    deliveryFees?: DeliveryFeeResult | null;
    isRushDelivery: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, deliveryFees = null, isRushDelivery }) => {
    // Calculate the total with delivery fees
    const standardDeliveryFee = deliveryFees?.standard_delivery_fee || 0;
    const rushDeliveryFee = isRushDelivery ? deliveryFees?.rush_delivery_fee || 0 : 0;
    const totalDeliveryFee = standardDeliveryFee + rushDeliveryFee;
    const isFreeShipping = deliveryFees?.free_shipping_applied || false;

    const finalTotal = cart.total_including_vat + (isFreeShipping ? 0 : totalDeliveryFee);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                        <span className="text-muted-foreground flex items-center">
                            <PackageIcon className="h-4 w-4 mr-1" />
                            Items ({cart.item_count})
                        </span>
                        <span>{cart.total_excluding_vat} VND</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">VAT/Tax</span>
                        <span>{cart.vat_amount} VND</span>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex justify-between items-center">
                        <span className="flex items-center">
                            <TruckIcon className="h-4 w-4 mr-1" />
                            Standard Delivery
                        </span>
                        {deliveryFees ? (
                            isFreeShipping ? (
                                <span className="text-green-600">Free</span>
                            ) : (
                                <span>{standardDeliveryFee} VND</span>
                            )
                        ) : (
                            <span>Calculating...</span>
                        )}
                    </div>

                    {isRushDelivery && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground ml-5">Rush Fee</span>
                            {deliveryFees ? <span>{rushDeliveryFee} VND</span> : <span>Calculating...</span>}
                        </div>
                    )}

                    {deliveryFees?.free_shipping_applied && (
                        <div className="text-xs text-green-600 ml-5">
                            Free shipping applied on orders over {deliveryFees.total_order_value} VND
                        </div>
                    )}

                    <Separator className="my-2" />

                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{finalTotal} VND</span>
                    </div>
                </div>

                {/* Order Items Preview */}
                <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Order Items</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {cart.items.map((item) => (
                            <div key={item.product_id} className="flex justify-between text-sm">
                                <div className="flex-1">
                                    <span className="font-medium">{item.title}</span>
                                    <div className="flex text-muted-foreground text-xs">
                                        <span className="mr-2">{item.media_type}</span>
                                        <span>x{item.quantity}</span>
                                    </div>
                                </div>
                                <span>{item.subtotal} VND</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderSummary;
