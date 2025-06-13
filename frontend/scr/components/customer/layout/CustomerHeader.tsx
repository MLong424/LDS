// src/components/customer/layout/CustomerHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';
import { useCartContext } from '@contexts/CartContext';
import { BookOpen } from 'lucide-react';
import { cn } from '@utils/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import the new focused components
import { SearchBar } from '../header/SearchBar';
import { UserActions } from '../header/UserActions';
import { NavigationMenuMain } from '../header/NavigationMenu';
import { MobileMenu } from '../header/MobileMenu';
import { useHeaderState } from '../header/useHeaderState';

const CustomerHeader: React.FC = () => {
    const { user, logout } = useAuthContext();
    const { cart } = useCartContext();
    const {
        searchQuery,
        setSearchQuery,
        isScrolled,
        showSearchSuggestions,
        setShowSearchSuggestions,
    } = useHeaderState();

    const itemCount = cart?.item_count || 0;

    return (
        <TooltipProvider>
            <header
                className={cn(
                    'sticky top-0 z-50 w-full transition-all duration-200',
                    isScrolled ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-background'
                )}
            >
                {/* Top notification bar */}
                <div className="bg-primary text-primary-foreground py-1 px-4 text-center text-sm hidden md:block">
                    <span>Free shipping on orders over $50 | Use code WELCOME15 for 15% off your first order</span>
                </div>

                {/* Main header */}
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo and Mobile Menu */}
                        <div className="flex items-center gap-3">
                            <MobileMenu user={user} onLogout={logout} />
                            
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-2">
                                <BookOpen className="h-8 w-8 text-primary" />
                                <span className="font-bold text-xl hidden sm:block">Mediastore</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <NavigationMenuMain className="hidden md:flex" />

                        {/* Search Bar */}
                        <SearchBar
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            showSuggestions={showSearchSuggestions}
                            onShowSuggestionsChange={setShowSearchSuggestions}
                            className="hidden md:block flex-1 max-w-md mx-4"
                        />

                        {/* User Actions */}
                        <UserActions
                            user={user}
                            cartItemCount={itemCount}
                            onLogout={logout}
                        />
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="md:hidden pb-3">
                        <SearchBar
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            showSuggestions={showSearchSuggestions}
                            onShowSuggestionsChange={setShowSearchSuggestions}
                            className="w-full"
                        />
                    </div>
                </div>
            </header>
        </TooltipProvider>
    );
};

export default CustomerHeader;