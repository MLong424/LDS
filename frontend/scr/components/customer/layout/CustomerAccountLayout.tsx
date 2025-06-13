// src/components/customer/layout/CustomerAccountLayout.tsx
import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { User, Package, LogOut, ChevronRight, ChevronDown } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CustomerAccountLayoutProps {
    children: ReactNode;
}

export const CustomerAccountLayout: React.FC<CustomerAccountLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthContext();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Navigation items for sidebar
    const navItems = [
        {
            label: 'Account Overview',
            path: '/account',
            icon: <User className="h-5 w-5" />,
        },
        {
            label: 'My Orders',
            path: '/account/orders',
            icon: <Package className="h-5 w-5" />,
        },
    ];

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Helper to check if a link is active
    const isActive = (path: string) => {
        if (path === '/account') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <CustomerHeader />

            <main className="flex-grow">
                <div className="container py-6 md:py-8 max-w-5xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">My Account</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.first_name || 'Customer'}</p>
                    </div>

                    {/* Mobile Menu Collapsible */}
                    <div className="md:hidden mb-6">
                        <Collapsible
                            open={mobileMenuOpen}
                            onOpenChange={setMobileMenuOpen}
                            className="w-full border rounded-md"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex items-center justify-between w-full p-4">
                                    <span>Account Menu</span>
                                    {mobileMenuOpen ? (
                                        <ChevronDown className="h-5 w-5" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5" />
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="px-4 pb-4 pt-0 space-y-1">
                                    {navItems.map((item, index) => (
                                        <Button
                                            key={index}
                                            variant={isActive(item.path) ? 'secondary' : 'ghost'}
                                            className="w-full justify-start"
                                            asChild
                                        >
                                            <Link to={item.path} className="flex items-center gap-2">
                                                {item.icon}
                                                {item.label}
                                            </Link>
                                        </Button>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-destructive hover:text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-5 w-5 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar for desktop */}
                        <Card className="hidden md:block w-64 h-fit">
                            <CardContent className="p-4">
                                <nav className="space-y-1">
                                    {navItems.map((item, index) => (
                                        <Button
                                            key={index}
                                            variant={isActive(item.path) ? 'secondary' : 'ghost'}
                                            className="w-full justify-start"
                                            asChild
                                        >
                                            <Link to={item.path} className="flex items-center gap-2">
                                                {item.icon}
                                                {item.label}
                                            </Link>
                                        </Button>
                                    ))}
                                    <Separator className="my-2" />
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-destructive hover:text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-5 w-5 mr-2" />
                                        Sign Out
                                    </Button>
                                </nav>
                            </CardContent>
                        </Card>

                        {/* Main content */}
                        <div className="flex-grow">
                            <Card>
                                <CardContent className="p-6">{children}</CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <CustomerFooter />
        </div>
    );
};
