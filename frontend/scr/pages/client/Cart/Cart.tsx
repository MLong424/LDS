// src/pages/client/Cart/Cart.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartContext } from '@contexts/CartContext';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import CartItem from '@/components/customer/cart/CartItem';
import CartSummary from '@/components/customer/cart/CartSummary';
import EmptyCart from '@/components/customer/cart/EmptyCart';
import { LoadingSpinner } from '@components/common';

const Cart: React.FC = () => {
    const { cart, loading, error, getContents } = useCartContext();

    useEffect(() => {
        getContents();
    }, [getContents]);

    if (loading) {
        return <LoadingSpinner message="Loading your cart..." />;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => getContents()} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    // If cart is empty or has no items
    if (!cart || cart.items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="container max-w-5xl mx-auto py-8">
            <div className="flex items-center mb-6">
                <ShoppingCart className="mr-2 h-6 w-6" />
                <h1 className="text-2xl font-bold">Your Cart</h1>
                <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-1 text-sm">
                    {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
                </span>
            </div>

            {cart.has_insufficient_stock && (
                <div className="mb-6 p-4 border border-yellow-400 bg-yellow-50 rounded-md text-yellow-800">
                    <p className="font-medium">
                        Some items in your cart have insufficient stock. Please adjust quantities before checkout.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items - Left Side */}
                <div className="lg:col-span-2">
                    <Card className="p-4">
                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <React.Fragment key={item.product_id}>
                                    <CartItem item={item} />
                                    <Separator />
                                </React.Fragment>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Cart Summary - Right Side */}
                <div className="lg:col-span-1">
                    <CartSummary cart={cart} />

                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" asChild className="flex-1">
                            <Link to="/shop">Continue Shopping</Link>
                        </Button>
                        <Button asChild className="flex-1" disabled={cart.has_insufficient_stock}>
                            <Link to="/checkout">
                                Checkout <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
