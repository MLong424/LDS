// src/components/common/ErrorAlert.tsx
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
    message: string | null;
    dismissible?: boolean;
    onDismiss?: () => void;
    variant?: 'default' | 'destructive';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
    message,
    dismissible = true,
    onDismiss = () => {},
    variant = 'destructive',
}) => {
    if (!message) {
        return null;
    }

    return (
        <Alert variant={variant} className="mb-4 relative">
            <AlertDescription className="pr-8">
                {message}
            </AlertDescription>
            {dismissible && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={onDismiss}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </Alert>
    );
};