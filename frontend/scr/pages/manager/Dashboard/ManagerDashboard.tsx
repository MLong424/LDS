// src/pages/manager/Dashboard/ManagerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import Welcome from '@components/manager/dashboard/Welcome';
import Metrics from '@components/manager/dashboard/Metrics';
import Actions from '@components/manager/dashboard/Actions';
import Orders from '@components/manager/dashboard/RecentOrders';
import { DashboardStats } from '@components/common';

import { Alert, AlertDescription } from '@/components/ui/alert';

import { useOrderContext } from '@/contexts/OrderContext';
import { useProductContext } from '@/contexts/ProductContext';

const ManagerDashboard: React.FC = () => {
    const { getPendingOrders, pendingOrders, loading: ordersLoading } = useOrderContext();
    const { getProductList, products } = useProductContext();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        pendingOrders: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalRevenue: 0,
        recentOrdersValue: 0,
        completedOrdersToday: 0,
    });

    // Load dashboard data
    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Load pending orders
                await getPendingOrders();

                // Load products for inventory stats
                await getProductList({
                    page: 1,
                    page_size: 100,
                    include_out_of_stock: true,
                });
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Update stats when data changes
    useEffect(() => {
        if (pendingOrders && products) {
            const lowStockCount = products.filter((p) => p.stock < 10).length;
            const totalRevenue = 0;
            const recentOrdersValue = pendingOrders.reduce((sum, order) => sum + order.total_amount, 0);

            setStats({
                pendingOrders: pendingOrders.length,
                totalProducts: products.length,
                lowStockProducts: lowStockCount,
                totalRevenue,
                recentOrdersValue,
                completedOrdersToday: 0,
            });
        }
    }, [pendingOrders, products]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Welcome />

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Key Metrics */}
            <Metrics stats={stats}/>

            {/* Quick Actions */}
            <Actions stats={stats}/>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Orders ordersLoading={ordersLoading} pendingOrders={pendingOrders} />
                
            </div>
        </div>
    );
};

export default ManagerDashboard;
