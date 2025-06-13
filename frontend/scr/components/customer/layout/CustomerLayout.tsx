// src/components/customer/layout/CustomerLayout.tsx
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';

interface CustomerLayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children, showSidebar = false }) => {
    const location = useLocation();

    // Determine if we're on a product-related page that needs filters
    const isShopPage =
        location.pathname.includes('/shop') ||
        location.pathname.includes('/products') ||
        location.pathname.includes('/category');

    return (
        <div className="flex flex-col min-h-screen">
            <CustomerHeader />

            <main className="flex-grow flex justify-center m-2">
                {showSidebar && isShopPage ? (
                    <div className="container py-6 md:py-8 max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Main content */}
                            <div className="flex-grow">{children}</div>
                        </div>
                    </div>
                ) : (
                    <div className="container py-6 md:py-8 max-w-5xl mx-auto">{children}</div>
                )}
            </main>

            <CustomerFooter />
        </div>
    );
};