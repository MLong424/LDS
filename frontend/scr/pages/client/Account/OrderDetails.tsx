// src/pages/client/Account/OrderDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderContext } from '@contexts/OrderContext';
import { Order } from '@cusTypes/orders';

import { Button } from '@components/ui/button';
import { Separator } from '@components/ui/separator';
import { AlertCircle, ChevronLeft, FileText, Home, Printer } from 'lucide-react';
import { LoadingSpinner } from '@components/common';
import OrderItemList from '@/components/customer/order/OrderItemList';
import OrderSummaryCard from '@/components/customer/order/OrderSummaryCard';
import OrderStatusTimeline from '@/components/customer/order/OrderStatusTimeline';
import ShippingDetailsCard from '@/components/customer/order/ShippingDetailsCard';
import PaymentInfoCard from '@/components/customer/order/PaymentInfoCard';
import OrderStatusBadge from '@/components/customer/order/OrderStatusBadge';

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getOrderDetails, cancelOrder, loading, error } = useOrderContext();

    const [order, setOrder] = useState<Order | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) return;

            try {
                const response = await getOrderDetails(id);                
                setOrder(response.data || null);
            } catch (err) {
                console.error('Error fetching order details:', err);
            }
        };

        fetchOrderDetails();
    }, [id, getOrderDetails]);    

    const handleCancelOrder = async () => {
        if (!id || !order) return;

        // Only allow cancellation if order is in specific states
        if (!['PENDING_PROCESSING', 'APPROVED'].includes(order.order_status)) {
            setCancelError('This order cannot be cancelled in its current state.');
            return;
        }

        const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
        if (!confirmCancel) return;

        setCancelLoading(true);
        setCancelError(null);

        try {
            await cancelOrder(id);
            // Refresh order details after cancellation
            const response = await getOrderDetails(id);
            setOrder(response.data.data || null);
        } catch (err: any) {
            setCancelError(err.message || 'Failed to cancel order');
        } finally {
            setCancelLoading(false);
        }
    };

    const handlePrintOrder = () => {
        window.print();
    };

    if (loading && !order) {
        return <LoadingSpinner message="Loading order details..." />;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex items-center justify-center p-8 text-red-500">
                    <AlertCircle className="h-8 w-8 mr-2" />
                    <p>{error}</p>
                </div>
                <div className="flex justify-center mt-4">
                    <Button onClick={() => navigate('/account')}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Account
                    </Button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex items-center justify-center p-8">
                    <p>Order not found.</p>
                </div>
                <div className="flex justify-center mt-4">
                    <Button onClick={() => navigate('/account')}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Account
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-8 px-4 print:px-0 print:py-2">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <FileText className="h-6 w-6 mr-2" />
                        Order #{order.order_id}
                    </h1>
                    <p className="text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handlePrintOrder}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/account')}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                        <Home className="h-4 w-4 mr-2" />
                        Continue Shopping
                    </Button>
                </div>
            </div>

            {/* Order Header for print */}
            <div className="hidden print:block">
                <h1 className="text-xl font-bold">Order #{order.order_id}</h1>
                <div className="flex justify-between">
                    <p className="text-sm">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-sm">
                        Status: <span className="font-medium">{order.order_status}</span>
                    </p>
                </div>
            </div>

            {/* Order Status */}
            <div className="bg-muted/40 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <p className="text-sm font-medium">Current Status</p>
                    <div className="mt-1">
                        <OrderStatusBadge status={order.order_status} />
                    </div>
                </div>
                {['PENDING_PROCESSING', 'APPROVED'].includes(order.order_status) && (
                    <div className="print:hidden">
                        <Button variant="destructive" size="sm" onClick={handleCancelOrder} disabled={cancelLoading}>
                            {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                        </Button>
                        {cancelError && <p className="text-xs text-red-500 mt-1">{cancelError}</p>}
                    </div>
                )}
            </div>

            {/* Order Items */}
            <div>
                <h2 className="text-lg font-semibold mb-3">Order Items</h2>
                <OrderItemList items={order.items} />
            </div>

            <Separator className="my-6" />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <ShippingDetailsCard order={order} />
                    <PaymentInfoCard paymentInfo={order.payment_info} />
                </div>
                <div className="space-y-6">
                    <OrderSummaryCard order={order} />
                    <OrderStatusTimeline statusHistory={order.status_history} />
                </div>
            </div>

            {/* If order was rejected, show the reason */}
            {order.order_status === 'REJECTED' && order.rejected_reason && (
                <div className="mt-6 p-4 border border-red-200 bg-red-50 rounded-md">
                    <h3 className="font-medium text-red-700">Rejection Reason:</h3>
                    <p className="mt-1 text-red-600">{order.rejected_reason}</p>
                </div>
            )}

            {/* Bottom navigation for mobile */}
            <div className="mt-8 flex justify-between print:hidden">
                <Button variant="outline" onClick={() => navigate('/account')}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Button>
                {['PENDING_PROCESSING', 'APPROVED'].includes(order.order_status) && (
                    <Button variant="destructive" onClick={handleCancelOrder} disabled={cancelLoading}>
                        {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
