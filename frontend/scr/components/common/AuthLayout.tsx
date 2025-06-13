// src/components/AuthLayout.tsx
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Simple header with just the logo */}
            <header className="py-4 px-6 border-b self-center">
                <Link to="/" className="flex items-center gap-2">
                    <span className="font-bold text-xl hidden sm:inline-block text-blue-600 from-primary bg-clip-text">
                        Mediastore
                    </span>
                </Link>
            </header>

            {/* Main content */}
            <main className="flex-grow flex items-center justify-center">{children}</main>

            {/* Simple footer */}
            <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} Mediastore. All rights reserved.</p>
            </footer>
        </div>
    );
};

