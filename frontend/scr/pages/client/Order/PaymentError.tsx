// src/pages/client/Order/PaymentError.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { AlertTriangle } from 'lucide-react';

const PaymentError: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [errorCode, setErrorCode] = useState<string>('');
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        // Get error details from URL params
        const params = new URLSearchParams(location.search);
        const errorParam = params.get('error') || params.get('code') || 'unknown_error';
        const orderIdParam = params.get('order_id');

        setErrorCode(errorParam);
        if (orderIdParam) {
            setOrderId(orderIdParam);
        }
    }, [location]);

    // Get a user-friendly error message
    const getErrorMessage = () => {
        switch (errorCode) {
            case 'invalid_amount':
                return "The payment amount doesn't match the order total.";
            case 'invalid_signature':
                return 'The payment verification failed due to security reasons.';
            case 'server_error':
                return 'A server error occurred while processing your payment.';
            case '24':
                return 'The payment was cancelled or expired.';
            case '51':
                return 'Your account has insufficient funds.';
            case '99':
                return 'The payment was declined by your bank.';
            default:
                return 'There was a problem with your payment. Please try again.';
        }
    };

    const handleReturnToCheckout = () => {
        navigate('/checkout');
    };

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    const handleRetryPayment = () => {
        if (orderId) {
            // This would need to be implemented in your backend
            navigate(`/payment/retry?order_id=${orderId}`);
        } else {
            navigate('/checkout');
        }
    };

    return (
        <div className="container max-w-md mx-auto py-10">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
                    <p className="text-muted-foreground mb-6 text-center">{getErrorMessage()}</p>

                    <div className="flex flex-col gap-4 w-full">
                        {orderId && (
                            <Button onClick={handleRetryPayment} className="w-full">
                                Retry Payment
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleReturnToCheckout} className="w-full">
                            Return to Checkout
                        </Button>
                        <Button variant="ghost" onClick={handleContinueShopping} className="w-full">
                            Continue Shopping
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentError;
