import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ShoppingCart, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatProps } from '@components/common';

const QuickActions = ({ stats }: StatProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to manage your store</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                        <Link to="/manager/orders">
                            <ShoppingCart className="h-6 w-6" />
                            <span>View Orders</span>
                            {stats.pendingOrders > 0 && (
                                <Badge variant="destructive" className="mt-1">
                                    {stats.pendingOrders}
                                </Badge>
                            )}
                        </Link>
                    </Button>

                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                        <Link to="/manager/payments">
                            <CreditCard className="h-6 w-6" />
                            <span>View Payments</span>
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default QuickActions;
