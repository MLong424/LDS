import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatters';
import { OrderItemProps, getOrderStatusBadge, getPaymentStatusBadge } from '@components/common';

const OrderItemsHeader: React.FC<OrderItemProps> = ({ order }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link to="/manager/orders">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{order.order_id}</h1>
                    <p className="text-gray-600 mt-1">Order placed on {formatDate(order.created_at)}</p>
                </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
                {getOrderStatusBadge(order.order_status)}
                {getPaymentStatusBadge(order.payment_status)}
            </div>
        </div>
    );
};
export default OrderItemsHeader;