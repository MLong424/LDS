// src/components/cart/EmptyCart.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { useAuthContext } from '@contexts/AuthContext';

const EmptyCart: React.FC = () => {
    const { user } = useAuthContext();

    return (
        <div className="container max-w-md mx-auto py-16">
            <Card className="text-center">
                <CardContent className="pt-6 flex flex-col items-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                    <p className="text-muted-foreground mb-6">
                        Looks like you haven't added any items to your cart yet.
                    </p>
                    <Button asChild size="lg">
                        <Link to="/shop">Start Shopping</Link>
                    </Button>
                </CardContent>
            </Card>

            {!user && (
                <div className="mt-8 text-center">
                    <h3 className="text-lg font-medium mb-2">Have an account?</h3>
                    <p className="text-muted-foreground mb-4">
                        Sign in to see if you have any saved items from a previous session.
                    </p>
                    <Button variant="outline" asChild>
                        <Link to="/login">Sign In</Link>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EmptyCart;
