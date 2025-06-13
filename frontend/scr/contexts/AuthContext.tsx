// src/contexts/AuthContext.tsx
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { User, RegisterUserDto, LoginCredentials, ChangePasswordDto } from '@cusTypes/auth';

// Legacy interface for backward compatibility
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    clearError: () => void;
    register: (userData: RegisterUserDto) => Promise<any>;
    login: (credentials: LoginCredentials) => Promise<any>;
    logout: () => Promise<any>;
    forgotPassword: (email: string) => Promise<any>;
    resetPassword: (token: string, newPassword: string) => Promise<any>;
    getProfile: () => Promise<any>;
    updateProfile: (userData: Partial<User>) => Promise<any>;
    changePassword: (data: ChangePasswordDto) => Promise<any>;
    getAllUsers: () => Promise<any>;
    blockUser: (userId: string) => Promise<any>;
    setUserRoles: (userId: string, roles: string[]) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();

    // Check if user is already logged in when the app loads
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                await auth.getProfile();
            } catch (error) {
                // If there's an error, user is not logged in - do nothing
            }
        };

        checkAuthStatus();
    }, []);

    // Create value that implements both legacy and new interfaces
    const contextValue: AuthContextType = {
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        clearError: auth.clearError,
        register: auth.register,
        login: auth.login,
        logout: auth.logout,
        forgotPassword: auth.forgotPassword,
        resetPassword: auth.resetPassword,
        getProfile: auth.getProfile,
        updateProfile: auth.updateProfile,
        changePassword: auth.changePassword,
        getAllUsers: auth.getAllUsers,
        blockUser: auth.blockUser,
        setUserRoles: auth.setUserRoles,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
