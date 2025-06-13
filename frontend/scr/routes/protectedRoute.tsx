// src/routes/protectedRoute.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';
import { LoadingSpinner } from '@components/common';

type Role = 'ADMIN' | 'PRODUCT_MANAGER' | 'CUSTOMER';

interface ProtectedRouteProps {
    children: ReactNode;
    roles?: Role[];
}

export const ProtectedRoute = ({ children, roles = [] }: ProtectedRouteProps) => {
    const location = useLocation();
    const { user, loading, getProfile } = useAuthContext();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    // Check for cookie token and fetch user profile if not already loaded
    useEffect(() => {
        // Only run this once
        if (!authChecked) {
            const checkAuth = async () => {
                setIsCheckingAuth(true);
                try {
                    // If we already have a user, we're authenticated
                    if (user) {
                        setIsCheckingAuth(false);
                        setAuthChecked(true);
                        return;
                    }
                    
                    // Otherwise, try to get the profile
                    await getProfile();
                    // If successful, the user state will be updated in the context
                } catch (error) {
                    // Profile fetch failed - likely no valid token
                    console.log('Authentication check failed', error);
                } finally {
                    setIsCheckingAuth(false);
                    setAuthChecked(true);
                }
            };
            
            checkAuth();
        }
    }, [user, getProfile, authChecked]);

    // Show loading indicator while checking authentication
    if (loading || isCheckingAuth) {
        return <LoadingSpinner fullPage message="Verifying authentication..." />;
    }

    // After we've checked auth status, if there's still no user, redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (roles.length > 0 && !roles.some((role) => user.roles.includes(role))) {
        // Redirect based on their role
        if (user.roles.includes('ADMIN')) {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.roles.includes('PRODUCT_MANAGER')) {
            return <Navigate to="/manager/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;