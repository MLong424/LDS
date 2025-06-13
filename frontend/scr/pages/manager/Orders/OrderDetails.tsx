// src/pages/manager/Orders/OrderDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common';

import { useOrderContext } from '@/contexts/OrderContext';
import { Order } from '@/types/orders';
import OrderItemsSidebar from '../../../components/manager/orders/Sidebar';
import OrderItems from '../../../components/manager/orders/OrderItems';
import OrderItemsHeader from '../../../components/manager/orders/Header';

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getOrderDetails, approveOrder, rejectOrder, loading, error } = useOrderContext();

    const [order, setOrder] = useState<Order | null>(null);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    // Load order details
    useEffect(() => {
        if (id) {
            loadOrderDetails();
        }
    }, [id]);

    const loadOrderDetails = async () => {
        if (!id) return;

        try {
            const response = await getOrderDetails(id);
            if (response.data) {
                setOrder(response.data);
            }
        } catch (err) {
            console.error('Error loading order details:', err);
        }
    };

    // Handle approve order
    const handleApprove = async () => {
        if (!order) return;

        setApproving(true);
        try {
            await approveOrder(order.order_id);
            await loadOrderDetails(); // Refresh order data
        } catch (err) {
            console.error('Error approving order:', err);
        } finally {
            setApproving(false);
        }
    };

    // Handle reject order
    const handleReject = async () => {
        if (!order || !rejectReason.trim()) return;

        setRejecting(true);
        try {
            await rejectOrder(order.order_id, rejectReason);
            await loadOrderDetails(); // Refresh order data
            setRejectDialogOpen(false);
            setRejectReason('');
        } catch (err) {
            console.error('Error rejecting order:', err);
        } finally {
            setRejecting(false);
        }
    };

    if (loading && !order) {
        return <LoadingSpinner fullPage message="Loading order details..." />;
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Order not found</h2>
                <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or has been removed.</p>
                <Button asChild>
                    <Link to="/manager/orders">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>
                </Button>
            </div>
        );
    }

    const canApprove = order.order_status === 'PENDING_PROCESSING' && order.payment_status === 'COMPLETED';
    const canReject = order.order_status === 'PENDING_PROCESSING';

    return (
        <div className="space-y-6">
            {/* Header */}
            <OrderItemsHeader order={order} />

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Action Buttons */}
            {(canApprove || canReject) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Order Actions</CardTitle>
                        <CardDescription>Review and process this order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            {canApprove && (
                                <Button
                                    onClick={handleApprove}
                                    disabled={approving}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {approving ? (
                                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Approve Order
                                </Button>
                            )}
                            {canReject && (
                                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject Order
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Reject Order</DialogTitle>
                                            <DialogDescription>
                                                Please provide a reason for rejecting this order. The customer will be
                                                notified.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="reason">Rejection Reason</Label>
                                                <Textarea
                                                    id="reason"
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Enter reason for rejection..."
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleReject}
                                                disabled={rejecting || !rejectReason.trim()}
                                            >
                                                {rejecting ? (
                                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                )}
                                                Reject Order
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <OrderItems order={order} />

                {/* Sidebar */}
                <OrderItemsSidebar order={order} />
            </div>
        </div>
    );
};

export default OrderDetails;
