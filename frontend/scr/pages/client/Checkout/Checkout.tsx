// src/pages/client/Checkout/Checkout.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartContext } from '@contexts/CartContext';
import { useOrderContext } from '@contexts/OrderContext';
import { usePaymentContext } from '@contexts/PaymentContext';
import { OrderDto } from '@cusTypes/orders';
import { DeliveryFeeCalculation, DeliveryFeeResult } from '@cusTypes/cart';
import { PaymentUrlRequest } from '@cusTypes/payments';

import CheckoutSteps, { CheckoutStep } from '@/components/customer/checkout/CheckoutSteps';
import CheckoutForm from '@/components/customer/checkout/CheckoutForm';
import OrderSummary from '@/components/customer/checkout/OrderSummary';
import PaymentMethods from '@/components/customer/checkout/PaymentMethods';
import { LoadingSpinner } from '@components/common';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { CheckCircle, AlertTriangle, ArrowLeft, Loader } from 'lucide-react';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        cart,
        loading: cartLoading,
        getContents,
        validateCart,
        calculateDeliveryFees,
        clearCart,
    } = useCartContext();
    const { createOrder, loading: orderLoading, error: orderError } = useOrderContext();
    const { createPaymentUrl, loading: paymentLoading } = usePaymentContext();

    // Checkout state
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
    const [deliveryFees, setDeliveryFees] = useState<DeliveryFeeResult | null>(null);
    const [isRushDelivery, setIsRushDelivery] = useState<boolean>(false);
    const [orderData, setOrderData] = useState<OrderDto | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderTotal, setOrderTotal] = useState<number>(0);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);

    // Load and validate cart on mount
    useEffect(() => {
        const loadCart = async () => {
            try {
                await getContents();
                const validationResult = await validateCart();

                if (!validationResult.data.is_valid) {
                    setValidationError(validationResult.data.message);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setValidationError('Failed to load or validate your cart. Please try again.');
            }
        };

        loadCart();
    }, [getContents, validateCart]);

    // Check URL params for order success/failure
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const orderId = params.get('order_id');

        if (status === 'success' && orderId) {
            setOrderId(orderId);
            setCurrentStep('confirmation');
            clearCart();
        }
    }, [location, clearCart]);

    // Handle delivery fee calculation when delivery info changes
    const calculateDelivery = async (provinceValue: string, address: string, isRush: boolean) => {
        if (!provinceValue) return;

        try {
            const deliveryInfo: DeliveryFeeCalculation = {
                province: provinceValue,
                address: address,
                is_rush_delivery: isRush,
            };

            const result = await calculateDeliveryFees(deliveryInfo);

            setDeliveryFees(result.data);
        } catch (error) {
            console.error('Error calculating delivery fees:', error);
        }
    };

    // Handle shipping form submission
    const handleShippingSubmit = async (data: OrderDto) => {
        setOrderData(data);
        setIsRushDelivery(data.delivery_type === 'RUSH');

        // Calculate final delivery fees
        await calculateDelivery(data.delivery_province, data.delivery_address, data.delivery_type === 'RUSH');

        // Move to payment step
        setCurrentStep('payment');
    };

    // Calculate total with delivery fees
    useEffect(() => {
        if (cart && deliveryFees) {
            const standardFee = deliveryFees.free_shipping_applied ? 0 : deliveryFees.standard_delivery_fee;
            const rushFee = isRushDelivery ? deliveryFees.rush_delivery_fee : 0;
            setOrderTotal(cart.total_including_vat + standardFee + rushFee);
        } else if (cart) {
            setOrderTotal(cart.total_including_vat);
        }
    }, [cart, deliveryFees, isRushDelivery]);

    // Process payment and create order
    const handleProceedToPayment = async () => {
        if (!orderData || !cart) return;

        try {
            setProcessingPayment(true);

            // Create the order first
            const orderResponse = await createOrder(orderData);
            const newOrderId = orderResponse.data.order_id;
            setOrderId(newOrderId);

            // Create payment URL
            const paymentUrlData: PaymentUrlRequest = {
                order_id: newOrderId,
                amount: orderTotal,
                order_info: `Payment for Order #${newOrderId}`,
            };

            const paymentUrlResponse = await createPaymentUrl(paymentUrlData);
            const vnpayUrl = paymentUrlResponse.data.payment_url;

            // Redirect to VNPAY
            window.location.href = vnpayUrl;
        } catch (error) {
            console.error('Error processing order:', error);
            setProcessingPayment(false);
        }
    };

    // Return to cart
    const handleReturnToCart = () => {
        navigate('/cart');
    };

    // Go back to shipping step
    const handleBackToShipping = () => {
        setCurrentStep('shipping');
    };

    // Handle continue shopping after order confirmation
    const handleContinueShopping = () => {
        navigate('/shop');
    };

    // Show processing state
    if (processingPayment) {
        return (
            <div className="container max-w-md mx-auto py-10">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                        <Loader className="h-12 w-12 text-blue-500 mb-4 animate-spin" />
                        <h2 className="text-xl font-bold mb-2">Processing Payment</h2>
                        <p className="text-muted-foreground mb-6 text-center">
                            Please wait while we redirect you to the VNPAY payment gateway...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show loading state
    if (cartLoading) {
        return <LoadingSpinner message="Loading checkout information..." />;
    }

    // Check if cart exists and has items
    if (!cart || cart.items.length === 0) {
        return (
            <div className="container max-w-md mx-auto py-10">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Your Cart is Empty</h2>
                        <p className="text-muted-foreground mb-6 text-center">
                            You can't proceed to checkout with an empty cart.
                        </p>
                        <Button onClick={handleReturnToCart}>Return to Cart</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show cart validation error
    if (validationError) {
        return (
            <div className="container max-w-md mx-auto py-10">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Cart Validation Error</h2>
                        <p className="text-muted-foreground mb-6 text-center">{validationError}</p>
                        <Button onClick={handleReturnToCart}>Return to Cart</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto py-8">
            <CheckoutSteps currentStep={currentStep} />

            {/* Shipping Step */}
            {currentStep === 'shipping' && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <CheckoutForm onSubmit={handleShippingSubmit} loading={orderLoading} error={orderError} />
                        </div>
                        <div className="lg:col-span-1">
                            <OrderSummary cart={cart} deliveryFees={deliveryFees} isRushDelivery={isRushDelivery} />
                            <Button variant="outline" className="w-full mt-4" onClick={handleReturnToCart}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return to Cart
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && orderData && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card className="mb-6">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Name</p>
                                                <p className="font-medium">{orderData.recipient_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{orderData.recipient_email}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{orderData.recipient_phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Delivery Address</p>
                                            <p className="font-medium">{orderData.delivery_address}</p>
                                            <p className="font-medium">{orderData.delivery_province}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Delivery Method</p>
                                            <p className="font-medium">
                                                {orderData.delivery_type === 'RUSH'
                                                    ? 'Rush Delivery'
                                                    : 'Standard Delivery'}
                                            </p>
                                            {orderData.delivery_type === 'RUSH' && orderData.rush_delivery_time && (
                                                <p className="text-sm">
                                                    Requested time:{' '}
                                                    {new Date(orderData.rush_delivery_time).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="outline" className="mt-4" onClick={handleBackToShipping}>
                                        Edit Shipping Information
                                    </Button>
                                </CardContent>
                            </Card>

                            <PaymentMethods
                                onProceedToPayment={handleProceedToPayment}
                                loading={paymentLoading || orderLoading}
                                orderTotal={orderTotal}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <OrderSummary cart={cart} deliveryFees={deliveryFees} isRushDelivery={isRushDelivery} />
                        </div>
                    </div>
                </>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && orderId && (
                <div className="max-w-2xl mx-auto">
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
                                        Your payment has been successfully processed through VNPAY. A confirmation email
                                        will be sent to you shortly.
                                    </p>
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => navigate(`/account/orders/${orderId}`)}>
                                    View Order Details
                                </Button>
                                <Button onClick={handleContinueShopping}>Continue Shopping</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Checkout;
