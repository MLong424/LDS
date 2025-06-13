// src/components/cart/CartSummary.tsx
import React from 'react';
import { Cart } from '@cusTypes/cart';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';

import { Separator } from '@components/ui/separator';
import { CreditCard, TruckIcon } from 'lucide-react';

interface CartSummaryProps {
    cart: Cart;
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart }) => {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Summary Items */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{cart.total_excluding_vat} VND</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">VAT/Tax</span>
                        <span>{cart.vat_amount} VND</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center">
                            <TruckIcon className="h-4 w-4 mr-1" />
                            Estimated Shipping
                        </span>
                        <span>Calculated at checkout</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{cart.total_including_vat} VND</span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">We Accept</h3>
                    <div className="flex space-x-2">
                        <div className="rounded-md border p-2">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="rounded-md border p-2 text-center text-xs font-medium">VNPay</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CartSummary;
