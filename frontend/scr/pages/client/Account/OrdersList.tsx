// src/pages/client/Account/OrdersList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';
import { useOrderContext } from '@contexts/OrderContext';
import { Order, OrderSummary } from '@cusTypes/orders';

import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { LoadingSpinner } from '@components/common';
import {
    SearchIcon,
    ShoppingBagIcon,
    PackageIcon,
    CalendarIcon,
    ArrowUpRight,
    AlertTriangle,
    MapPinIcon,
    UserIcon,
} from 'lucide-react';

const OrdersList: React.FC = () => {
    const { user } = useAuthContext();
    const { getUserOrders, loading, error } = useOrderContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]);    
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getUserOrders({ page: 1, page_size: 20 });
                
                if (response) {
                    setOrders(response.orders || []);
                    setFilteredOrders(response.orders || []);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user, getUserOrders]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(
                (order) =>
                    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.delivery_province.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.order_status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOrders(filtered);
        }
    }, [searchTerm, orders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING_PROCESSING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-blue-100 text-blue-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'SHIPPED':
                return 'bg-indigo-100 text-indigo-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            case 'REFUNDED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleRetry = async () => {
        try {
            const response = await getUserOrders({ page: 1, page_size: 50 });
            if (response) {
                setOrders(response || []);
                setFilteredOrders(response || []);
            }
        } catch (error) {
            console.error('Error retrying order fetch:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading your orders..." />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center p-6">
                        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Error Loading Orders</h2>
                        <p className="text-muted-foreground text-center mb-4">{error}</p>
                        <Button onClick={handleRetry}>Try Again</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!loading && filteredOrders.length === 0 && searchTerm === '') {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center p-6">
                        <ShoppingBagIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-bold mb-2">No Orders Found</h2>
                        <p className="text-muted-foreground text-center mb-4">
                            You haven't placed any orders yet. Browse our products and place your first order!
                        </p>
                        <Button asChild>
                            <Link to="/shop">Start Shopping</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <PackageIcon className="h-6 w-6 mr-2" />
                        My Orders
                    </h1>
                    <p className="text-muted-foreground">Track and manage your order history</p>
                </div>

                <div className="relative w-full md:w-64">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredOrders.length === 0 && searchTerm !== '' && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                            <p>No orders found matching "{searchTerm}"</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-muted/30 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="flex items-center">
                                <ShoppingBagIcon className="h-4 w-4 mr-2" />
                                <span className="font-medium">Order #{order.id}</span>
                                <span className="mx-2 text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {formatDate(order.created_at)}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Badge className={getStatusColor(order.order_status)}>
                                    {order.order_status.replace('_', ' ')}
                                </Badge>
                                <Badge className={getPaymentStatusColor(order.payment_status)}>
                                    {order.payment_status}
                                </Badge>
                            </div>
                        </div>

                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <div className="flex items-start space-x-2">
                                        <UserIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Recipient</p>
                                            <p>{order.recipient_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <MapPinIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Shipping Address</p>
                                            <p>
                                                {order.delivery_province}, {order.delivery_address}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between items-end gap-2">
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm text-muted-foreground">Total Amount</p>
                                        <p className="font-bold text-lg">{order.total_amount} VND</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                                        <Link to={`/account/orders/${order.id}`}>
                                            View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {orders.length > 5 && (
                <div className="flex justify-center pt-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/shop">Continue Shopping</Link>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default OrdersList;
