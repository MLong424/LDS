// src/components/order/OrderStatusTimeline.tsx
import React from 'react';
import { OrderStatusHistory } from '@cusTypes/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { 
    CheckCircle, 
    Circle, 
    Clock, 
    PackageCheck,
    Truck,
    XCircle
} from 'lucide-react';

interface OrderStatusTimelineProps {
    statusHistory: OrderStatusHistory[];
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ statusHistory }) => {
    // Sort history by date (most recent last)
    const sortedHistory = [...statusHistory].sort((a, b) => 
        new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING_PROCESSING':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'APPROVED':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'REJECTED':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'SHIPPED':
                return <Truck className="h-5 w-5 text-blue-500" />;
            case 'DELIVERED':
                return <PackageCheck className="h-5 w-5 text-green-600" />;
            case 'CANCELED':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Circle className="h-5 w-5" />;
        }
    };

    const formatStatusText = (status: string) => {
        return status
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {sortedHistory.map((status, index) => (
                        <div key={index} className="flex items-start">
                            <div className="mr-4 mt-0.5">
                                {getStatusIcon(status.new_status)}
                            </div>
                            <div className="space-y-1 flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">
                                        {formatStatusText(status.new_status)}
                                    </p>
                                    <time className="text-sm text-muted-foreground">
                                        {formatDate(status.changed_at)}
                                    </time>
                                </div>
                                {status.notes && (
                                    <p className="text-sm text-muted-foreground">
                                        {status.notes}
                                    </p>
                                )}
                                {status.changed_by && (
                                    <p className="text-xs text-muted-foreground">
                                        by {status.changed_by}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderStatusTimeline;