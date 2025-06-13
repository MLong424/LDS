// src/components/customer/header/MobileMenu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Menu, 
    BookOpen, 
    Home, 
    Info, 
    Phone, 
    BookText, 
    Music, 
    Disc, 
    Film,
    ShoppingBag,
    User,
    LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import { MediaType } from '@cusTypes/products';
import { User as UserType } from '@cusTypes/auth';

interface MobileMenuProps {
    user: UserType | null;
    onLogout: () => Promise<void>;
}

interface MediaCategory {
    icon: React.ReactNode;
    type: MediaType;
    title: string;
    path: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ user, onLogout }) => {
    const mediaCategories: MediaCategory[] = [
        {
            icon: <BookText className="h-5 w-5" />,
            type: 'BOOK',
            title: 'Books',
            path: '/shop?media_type=BOOK',
        },
        {
            icon: <Music className="h-5 w-5" />,
            type: 'LP_RECORD',
            title: 'LP Records',
            path: '/shop?media_type=LP_RECORD',
        },
        {
            icon: <Disc className="h-5 w-5" />,
            type: 'CD',
            title: 'CDs',
            path: '/shop?media_type=CD',
        },
        {
            icon: <Film className="h-5 w-5" />,
            type: 'DVD',
            title: 'DVDs',
            path: '/shop?media_type=DVD',
        },
    ];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
                <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6" />
                        <span>Mediastore</span>
                    </SheetTitle>
                </SheetHeader>

                {/* User Welcome Section */}
                {user && (
                    <div className="flex items-center gap-3 mb-6 py-3 border-b">
                        <div>
                            <p className="font-medium">
                                {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">Hi, Welcome back!</p>
                        </div>
                    </div>
                )}

                {/* Main Navigation */}
                <nav className="flex flex-col gap-1">
                    <SheetClose asChild>
                        <Link
                            to="/"
                            className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md text-base"
                        >
                            <Home className="h-5 w-5" />
                            Home
                        </Link>
                    </SheetClose>

                    <SheetClose asChild>
                        <Link
                            to="/shop"
                            className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md text-base"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            All Products
                        </Link>
                    </SheetClose>

                    {/* Media Categories */}
                    <div className="border-t my-4" />
                    <div className="mb-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                        {mediaCategories.map((category) => (
                            <SheetClose key={category.type} asChild>
                                <Link
                                    to={category.path}
                                    className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md text-sm"
                                >
                                    {category.icon}
                                    {category.title}
                                </Link>
                            </SheetClose>
                        ))}
                    </div>

                    {/* Other Pages */}
                    <div className="border-t my-4" />
                    <SheetClose asChild>
                        <Link
                            to="/about"
                            className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md text-base"
                        >
                            <Info className="h-5 w-5" />
                            About
                        </Link>
                    </SheetClose>

                    <SheetClose asChild>
                        <Link
                            to="/contact"
                            className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md text-base"
                        >
                            <Phone className="h-5 w-5" />
                            Contact
                        </Link>
                    </SheetClose>

                    {/* User Account Section */}
                    {user ? (
                        <>
                            <div className="border-t my-4" />
                            <SheetClose asChild>
                                <Link
                                    to="/account"
                                    className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md text-base"
                                >
                                    <User className="h-5 w-5" />
                                    My Account
                                </Link>
                            </SheetClose>

                            <SheetClose asChild>
                                <button
                                    onClick={onLogout}
                                    className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md text-base w-full text-left"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign Out
                                </button>
                            </SheetClose>
                        </>
                    ) : (
                        <>
                            <div className="border-t my-4" />
                            <SheetClose asChild>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md text-base"
                                >
                                    <User className="h-5 w-5" />
                                    Sign In
                                </Link>
                            </SheetClose>
                        </>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
};