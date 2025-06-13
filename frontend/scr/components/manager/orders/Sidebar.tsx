import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { User, Mail, Phone, Truck, MapPin, Calendar, CreditCard, XCircle } from 'lucide-react';
import { OrderItemProps, getPaymentStatusBadge } from '@components/common';

const OrderItemsSidebar: React.FC<OrderItemProps> = ({ order }) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{order.recipient_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{order.recipient_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{order.recipient_phone}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Delivery Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Delivery Address</span>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">{order.delivery_address}</p>
                        <p className="text-sm text-gray-600 ml-6">{order.delivery_province}</p>
                    </div>
                    <div>
                        <span className="font-medium">Delivery Type:</span>
                        <Badge
                            variant="outline"
                            className={order.delivery_type === 'RUSH' ? 'ml-2 bg-orange-100 text-orange-800' : 'ml-2'}
                        >
                            {order.delivery_type === 'RUSH' ? 'Rush Delivery' : 'Standard Delivery'}
                        </Badge>
                    </div>
                    {order.rush_delivery_time && (
                        <div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Rush Delivery Time:</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{formatDate(order.rush_delivery_time)}</p>
                        </div>
                    )}
                    {order.rush_delivery_instructions && (
                        <div>
                            <span className="font-medium">Special Instructions:</span>
                            <p className="text-sm text-gray-600 mt-1">{order.rush_delivery_instructions}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span>Payment Status:</span>
                        {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Total Amount:</span>
                        <span className="font-bold">{formatCurrency(order.total_amount)}</span>
                    </div>

                    {order.payment_info && order.payment_info.length > 0 && (
                        <div className="space-y-3">
                            <Separator />
                            <h4 className="font-medium">Payment Details</h4>
                            {order.payment_info.map((payment, index) => (
                                <div key={index} className="p-3 border rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Payment ID:</span>
                                        <span className="text-sm">{payment.payment_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Method:</span>
                                        <Badge variant="outline">{payment.payment_method}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Amount:</span>
                                        <span className="text-sm font-medium">{formatCurrency(payment.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Date:</span>
                                        <span className="text-sm">{formatDate(payment.created_at)}</span>
                                    </div>
                                    {payment.vnpay_transaction_id && (
                                        <div className="flex justify-between">
                                            <span className="text-sm">Transaction ID:</span>
                                            <span className="text-sm font-mono">{payment.vnpay_transaction_id}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Rejection Reason (if rejected) */}
            {order.order_status === 'REJECTED' && order.rejected_reason && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" />
                            Rejection Reason
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">{order.rejected_reason}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
export default OrderItemsSidebar;