// src/components/customer/header/UserActions.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { User as UserType } from '@cusTypes/auth';

interface UserActionsProps {
    user: UserType | null;
    cartItemCount: number;
    onLogout: () => Promise<void>;
}

export const UserActions: React.FC<UserActionsProps> = ({
    user,
    cartItemCount,
    onLogout
}) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await onLogout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* Cart */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild className="relative">
                        <Link to="/cart">
                            <ShoppingCart className="h-5 w-5" />
                            {cartItemCount > 0 && (
                                <Badge 
                                    variant="destructive" 
                                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                >
                                    {cartItemCount > 99 ? '99+' : cartItemCount}
                                </Badge>
                            )}
                            <span className="sr-only">Cart ({cartItemCount} items)</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Cart ({cartItemCount} items)</p>
                </TooltipContent>
            </Tooltip>

            {/* User Account */}
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                            <span className="sr-only">User menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div>
                                <p className="font-medium">
                                    {user.first_name} {user.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link to="/account" className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    Account Overview
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/account/orders" className="cursor-pointer">
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Order History
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/login">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link to="/register">Sign Up</Link>
                    </Button>
                </div>
            )}
        </div>
    );
};