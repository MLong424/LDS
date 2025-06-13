// src/components/manager/sidebar/DesktopSidebar.tsx
import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, CreditCard, BookOpen, LogOut, ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthContext();

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
        <aside
            className={`bg-white border-r border-gray-200 hidden md:flex flex-col ${
                isCollapsed ? 'w-16' : 'w-64'
            } transition-all duration-300`}
        >
            <div className="p-4 flex justify-between items-center border-b">
                {!isCollapsed && (
                    <Link to="/manager/dashboard" className="font-bold text-xl text-primary">
                        Manager
                    </Link>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            <nav className="flex-1 py-6 px-3">
                <TooltipProvider delayDuration={100}>
                    <ul className="space-y-1">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                {isCollapsed ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link
                                                to={item.path}
                                                className={`flex justify-center py-3 px-3 rounded-md relative ${
                                                    isActiveRoute(item.path)
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {item.icon}
                                                {item.badge && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
                                                    >
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            {item.title}
                                            {item.badge ? ` (${item.badge})` : ''}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 py-3 px-3 rounded-md ${
                                            isActiveRoute(item.path)
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
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
                                )}
                            </li>
                        ))}
                    </ul>
                </TooltipProvider>
            </nav>

            <div className="p-4 border-t">
                {isCollapsed ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleLogout} className="w-full">
                                <LogOut className="h-5 w-5 text-gray-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Sign Out</TooltipContent>
                    </Tooltip>
                ) : (
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
                )}
            </div>
        </aside>
    );
};

export default DesktopSidebar;
