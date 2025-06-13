// src/pages/manager/Orders/PendingOrderList.tsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Search, Filter, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useOrderContext } from '@/contexts/OrderContext';
import { PendingOrder, PMOrdersParams } from '@/types/orders';
import { PaymentStatus } from '@/types/common';
import OrderTable from '@components/manager/orders/OrderTable';

const PendingOrderList: React.FC = () => {
    const { getAllOrders, loading, error } = useOrderContext();

    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 20,
        total_count: 0,
        total_pages: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load orders
    const loadOrders = async (params: PMOrdersParams = {}) => {
        try {
            const response = await getAllOrders({
                page: pagination.page,
                page_size: pagination.page_size,
                status: 'PENDING_PROCESSING',
                payment_status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchTerm || undefined,
                ...params,
            });

            if (response.data) {
                setOrders(response.data.orders || []);
                setPagination({
                    page: response.data.page || 1,
                    page_size: response.data.page_size || 20,
                    total_count: response.data.total_count || 0,
                    total_pages: response.data.total_pages || 0,
                });
            }
        } catch (err) {
            console.error('Error loading orders:', err);
        }
    };

    // Initial load
    useEffect(() => {
        loadOrders();
    }, [pagination.page, statusFilter]);

    // Handle search
    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadOrders({ page: 1 });
    };

    // Handle refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadOrders();
        setIsRefreshing(false);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Pending Orders</h1>
                    <p className="text-gray-600 mt-1">Manage and process customer orders</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        {isRefreshing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by order ID, customer name, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={statusFilter}
                                onValueChange={(value: PaymentStatus | 'all') => setStatusFilter(value)}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Payment Status" />
                                </SelectTrigger>
                                <SelectContent className='bg-amber-200'>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    <SelectItem value="COMPLETED">Paid</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                <Filter className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <OrderTable loading={loading} onPageChange={handlePageChange} orders={orders} pagination={pagination} />
        </div>
    );
};

export default PendingOrderList;
