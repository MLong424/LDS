// src/pages/client/Order/OrderSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrderContext } from '@contexts/OrderContext';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { CheckCircle } from 'lucide-react';
import {LoadingSpinner} from '@components/common';

const OrderSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getOrderDetails, loading, error } = useOrderContext();
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderLoaded, setOrderLoaded] = useState<boolean>(false);

    useEffect(() => {
        // Get order ID from URL params
        const params = new URLSearchParams(location.search);
        const orderIdParam = params.get('id');
        console.log('Order ID from URL:', orderIdParam);
        

        if (orderIdParam) {
            setOrderId(orderIdParam);

            // Load order details
            const loadOrderDetails = async () => {
                try {
                    await getOrderDetails(orderIdParam);
                    setOrderLoaded(true);
                } catch (error) {
                    console.error('Error loading order details:', error);
                }
            };

            loadOrderDetails();
        } else {
            // No order ID in params, redirect to home
            navigate('/');
        }
    }, [location, getOrderDetails, navigate]);

    const handleViewOrderDetails = () => {
        if (orderId) {
            navigate(`/account/orders/${orderId}`);
        }
    };

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    if (loading || !orderLoaded) {
        return <LoadingSpinner message="Loading order information..." />;
    }

    if (error) {
        return (
            <div className="container max-w-md mx-auto py-10">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                        <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Order</h2>
                        <p className="text-muted-foreground mb-6 text-center">{error}</p>
                        <Button onClick={handleContinueShopping}>Continue Shopping</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto py-10">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                    <p className="text-lg mb-1">Thank you for your purchase</p>
                    <p className="text-muted-foreground mb-6 text-center">
                        Your order #{orderId} has been placed successfully.
                    </p>

                    <Alert className="mb-6">
                        <AlertTitle>Order Details</AlertTitle>
                        <AlertDescription>
                            <p>
                                Your payment has been successfully processed through VNPAY. A confirmation email will be
                                sent to you shortly.
                            </p>
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={handleViewOrderDetails}>
                            View Order Details
                        </Button>
                        <Button onClick={handleContinueShopping}>Continue Shopping</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderSuccess;
