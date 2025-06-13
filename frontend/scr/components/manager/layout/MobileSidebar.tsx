// src/components/manager/sidebar/DesktopSidebar.tsx
import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, CreditCard, BookOpen, LogOut, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

type NavItem = {
    title: string;
    path: string;
    icon: React.ReactElement;
    badge?: number;
};

// Mock pending notifications/counts
const pendingOrdersCount = 5;

// Navigation items
const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        path: '/manager/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        title: 'Orders',
        path: '/manager/orders',
        icon: <ShoppingCart className="h-5 w-5" />,
        badge: pendingOrdersCount,
    },
    {
        title: 'Payments',
        path: '/manager/payments',
        icon: <CreditCard className="h-5 w-5" />,
    },
    {
        title: 'Catalog',
        path: '/manager/catalog',
        icon: <BookOpen className="h-5 w-5" />,
    },
];

const DesktopSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthContext();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Check if a route is active
    const isActiveRoute = (path: string) => {
        if (path === '/admin/dashboard') {
            return location.pathname === path;
        }

        // Check for child paths (like /admin/products/edit/1)
        return location.pathname.startsWith(path);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Get user initials for avatar
    const getUserInitials = (): string => {
        if (!user) return '?';
        return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`;
    };

    return (
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-10">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <SheetTitle>
                            <Link to="/manager/dashboard" className="font-bold text-xl text-primary">
                                Manager
                            </Link>
                        </SheetTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </SheetHeader>
                <nav className="flex-1 py-6 px-3">
                    <ul className="space-y-1">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 py-3 px-3 rounded-md ${
                                        isActiveRoute(item.path)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <div className="relative">
                                        {item.icon}
                                        {item.badge && (
                                            <Badge
                                                variant="destructive"
                                                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                                <AvatarFallback>{getUserInitials()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-2 overflow-hidden">
                                <p className="text-sm font-medium truncate">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5 text-gray-600" />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default DesktopSidebar;
