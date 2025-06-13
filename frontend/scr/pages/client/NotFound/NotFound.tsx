// src/pages/client/NotFound/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home, Search, ShoppingCart, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* 404 Icon and Title */}
            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
                    <AlertCircle className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">404</h1>
                <p className="text-xl md:text-2xl mt-2 text-muted-foreground">Page Not Found</p>
            </div>

            {/* Main Card */}
            <Card className="max-w-md w-full mb-8">
                <CardContent className="pt-6">
                    <p className="text-center mb-6">
                        The page you're looking for doesn't exist or has been moved. Here are some helpful links
                        instead:
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <Link
                            to="/"
                            className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <Home className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-sm font-medium">Home</span>
                        </Link>

                        <Link
                            to="/shop"
                            className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <ShoppingCart className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-sm font-medium">Shop</span>
                        </Link>

                        <Link
                            to="/contact"
                            className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <AlertCircle className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-sm font-medium">Help</span>
                        </Link>

                        <Link
                            to="/search"
                            className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <Search className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-sm font-medium">Search</span>
                        </Link>
                    </div>

                    <div className="flex justify-center">
                        <Button variant="outline" asChild>
                            <Link to="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Help Text */}
            <div className="text-center max-w-md">
                <p className="text-muted-foreground text-sm">
                    If you believe this is an error, please{' '}
                    <Link to="/contact" className="text-primary underline hover:text-primary/80">
                        contact our support team
                    </Link>{' '}
                    for assistance.
                </p>
            </div>
        </div>
    );
};