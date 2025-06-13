// src/components/common/LoadingSpinner.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@utils/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullPage?: boolean;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md', 
    message = 'Loading...', 
    fullPage = false,
    className 
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    const spinnerElement = (
        <Loader2 
            className={cn(
                "animate-spin",
                sizeClasses[size],
                className
            )} 
        />
    );

    if (fullPage) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                {spinnerElement}
                {message && (
                    <p className="mt-3 text-sm text-muted-foreground">
                        {message}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center">
            <div className="mr-2">
                {spinnerElement}
            </div>
            {message && (
                <span className="text-sm text-muted-foreground">
                    {message}
                </span>
            )}
        </div>
    );
};