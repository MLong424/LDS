import React from 'react';
import { Package, Clock, BookOpen, Disc, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { MediaType } from '@/types';
import { OrderItemProps, getOrderStatusBadge } from '@components/common';

const OrderItems: React.FC<OrderItemProps> = ({ order }) => {
    const getMediaTypeIcon = (mediaType: MediaType) => {
        switch (mediaType) {
            case 'BOOK':
                return <BookOpen className="h-4 w-4" />;
            case 'CD':
            case 'LP_RECORD':
                return <Disc className="h-4 w-4" />;
            case 'DVD':
                return <Film className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    return (
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Items
                    </CardTitle>
                    <CardDescription>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Rush</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{getMediaTypeIcon(item.media_type)}</span>
                                                <span className="font-medium">{item.product_title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.media_type}</Badge>
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(item.unit_price * item.quantity)}
                                        </TableCell>
                                        <TableCell>
                                            {item.is_rush_delivery ? (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                    Rush
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Standard</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Separator className="my-4" />

                    {/* Order Summary */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.products_total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VAT:</span>
                            <span>{formatCurrency(order.vat_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery Fee:</span>
                            <span>{formatCurrency(order.delivery_fee)}</span>
                        </div>
                        {order.rush_delivery_fee > 0 && (
                            <div className="flex justify-between">
                                <span>Rush Delivery Fee:</span>
                                <span>{formatCurrency(order.rush_delivery_fee)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Status History */}
            {order.status_history && order.status_history.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Status History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.status_history.map((history, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {getOrderStatusBadge(history.new_status)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(history.changed_at)}
                                            </span>
                                        </div>
                                        {history.changed_by && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Changed by: {history.changed_by}
                                            </p>
                                        )}
                                        {history.notes && <p className="text-sm text-gray-600 mt-1">{history.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
export default OrderItems;