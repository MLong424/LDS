// src/pages/admin/Dashboard/AdminDashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, TrendingUp, Settings } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const stats = [
        {
            title: 'Total Users',
            value: '2,543',
            icon: Users,
            description: '+12% from last month',
            trend: 'up'
        },
        {
            title: 'Total Orders',
            value: '1,234',
            icon: ShoppingBag,
            description: '+5% from last month',
            trend: 'up'
        },
        {
            title: 'Revenue',
            value: '$12,345',
            icon: TrendingUp,
            description: '+8% from last month',
            trend: 'up'
        },
        {
            title: 'System Status',
            value: 'Healthy',
            icon: Settings,
            description: 'All systems operational',
            trend: 'stable'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of system metrics and administrative tools
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Administrative functions and system management tools.
                        </p>
                        <div className="text-sm">
                            • User Management<br />
                            • System Settings<br />
                            • Reports & Analytics<br />
                            • Security Configuration
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Latest system events and administrative actions.
                        </p>
                        <div className="mt-4 space-y-2 text-sm">
                            <div>• New user registration</div>
                            <div>• System backup completed</div>
                            <div>• Security update applied</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;