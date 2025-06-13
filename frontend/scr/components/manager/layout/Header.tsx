// src/components/manager/header/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const Header: React.FC = () => {
    const { user } = useAuthContext();
    const pendingOrdersCount = 5;

    // Get user initials for avatar
    const getUserInitials = (): string => {
        if (!user) return '?';
        return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`;
    };

    return (
        <header className="bg-white border-b p-4 flex justify-between items-center">
            <div className="md:hidden">
                <Link to="/manager/dashboard" className="font-bold text-xl text-primary">
                    Manager
                </Link>
            </div>

            {/* Notification button (both mobile and desktop) */}
            <div className="flex items-center gap-2 ml-auto">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
                            >
                                {pendingOrdersCount}
                            </Badge>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{pendingOrdersCount} pending orders</p>
                    </TooltipContent>
                </Tooltip>

                <div className="hidden md:block">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
};

export default Header;
