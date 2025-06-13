import {
    Order,
    PendingOrder,
    OrderStatus,
    PaymentStatus,
    ProductManagerParams,
    Product,
    PaginationType,
    ProductPriceHistory,
} from '@/types';
import { Badge } from '@/components/ui/badge';
// Dashboard statistics type
export interface DashboardStats {
    pendingOrders: number;
    totalProducts: number;
    lowStockProducts: number;
    totalRevenue: number;
    recentOrdersValue: number;
    completedOrdersToday: number;
}

export interface StatProps {
    stats: DashboardStats;
}

export interface RecentOrdersProps {
    ordersLoading: boolean;
    pendingOrders: PendingOrder[];
}

export interface OrderTableProps {
    orders: PendingOrder[];
    loading: boolean;
    onPageChange: (page: number) => void;
    pagination: {
        page: number;
        page_size: number;
        total_count: number;
        total_pages: number;
    };
}

export interface OrderItemProps {
    order: Order;
}

export const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING_PROCESSING':
            return (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pending
                </Badge>
            );
        case 'APPROVED':
            return (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Approved
                </Badge>
            );
        case 'REJECTED':
            return <Badge variant="destructive">Rejected</Badge>;
        case 'SHIPPED':
            return (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Shipped
                </Badge>
            );
        case 'DELIVERED':
            return (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Delivered
                </Badge>
            );
        case 'CANCELED':
            return (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    Canceled
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

export const getPaymentStatusBadge = (status: PaymentStatus) => {
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

// Filters component
export interface ProductFiltersProps {
    filters: ProductManagerParams;
    onFiltersChange: (filters: ProductManagerParams) => void;
    onReset: () => void;
}

export interface ProductRowProps {
    product: Product;
    onEdit: (id: number) => void;
    onView: (id: number) => void;
}

export interface ProductTableProps {
    products: Product[];
    pagination: PaginationType | null;
    filters: ProductManagerParams;
    onPageChange: (page: number) => void;
    onEdit: (id: number) => void;
    onView: (id: number) => void;
    onAddProduct: () => void;
    
}

export interface StatsCardProps {
    pagination: PaginationType | null;
    products: Product[];
}

interface StockStatus {
    variant: 'default' | 'secondary' | 'destructive';
    label: string;
    icon: React.ReactNode;
}

export interface QuickStatsProps {
    product: Product;
    stockStatus: StockStatus;
}

export interface DetailedInfoProps {
    product: Product;
    stockStatus: StockStatus;
    priceHistory: ProductPriceHistory[];
}