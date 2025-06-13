// src/components/order/OrderStatusBadge.tsx
import React from 'react';
import { OrderStatus } from '@cusTypes/orders';
import { PaymentStatus } from '@cusTypes/common';
import { Badge } from '@components/ui/badge';

interface OrderStatusBadgeProps {
    status: OrderStatus | PaymentStatus;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

    switch (status) {
        case 'PENDING_PROCESSING':
            variant = 'outline';
            break;
        case 'APPROVED':
        case 'SHIPPED':
        case 'COMPLETED':
            variant = 'default';
            break;
        case 'DELIVERED':
            variant = 'secondary';
            break;
        case 'REJECTED':
        case 'CANCELED':
        case 'FAILED':
            variant = 'destructive';
            break;
        case 'REFUNDED':
            variant = 'outline';
            break;
    }

    // Format the status for display (convert from SNAKE_CASE to Sentence Case)
    const formatStatus = (status: string) => {
        return status
            .toLowerCase()
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return <Badge variant={variant}>{formatStatus(status)}</Badge>;
};

export default OrderStatusBadge;
