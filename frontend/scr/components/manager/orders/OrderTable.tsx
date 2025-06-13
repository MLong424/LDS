import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { OrderTableProps } from '@components/common';

import { formatDate, formatCurrency } from '@/utils/formatters';
import { PaymentStatus } from '@/types';

const OrderTable: React.FC<OrderTableProps> = ({ loading, onPageChange, orders, pagination }) => {
    // Get payment status badge
    const getPaymentStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Paid
                    </Badge>
                );
            case 'PENDING':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pending
                    </Badge>
                );
            case 'FAILED':
                return <Badge variant="destructive">Failed</Badge>;
            case 'REFUNDED':
                return (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Refunded
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>{pagination.total_count} orders found</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner message="Loading orders..." />
                    </div>
                ) : orders.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Stock Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{order.recipient_name}</p>
                                                    <p className="text-sm text-gray-500">{order.recipient_email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {formatCurrency(order.total_amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={!order.has_sufficient_stock ? 'secondary' : 'destructive'}
                                                    className={
                                                        !order.has_sufficient_stock
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }
                                                >
                                                    {!order.has_sufficient_stock ? 'Available' : 'Low Stock'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{formatDate(order.created_at)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link to={`/manager/orders/${order.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {order.payment_status === 'COMPLETED' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-green-600 hover:text-green-700"
                                                                disabled={order.has_sufficient_stock}
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-500">
                                    Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
                                    {Math.min(pagination.page * pagination.page_size, pagination.total_count)} of{' '}
                                    {pagination.total_count} orders
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                            const page = i + 1;
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={pagination.page === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => onPageChange(page)}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.total_pages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">No orders found</h3>
                        <p className="text-gray-500">No pending orders at the moment.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
export default OrderTable;