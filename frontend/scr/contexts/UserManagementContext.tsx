import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@hooks/useAuth';
import { IUserManagementContext } from './interfaces/IAuthContext';

const UserManagementContext = createContext<IUserManagementContext | undefined>(undefined);

export const UserManagementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();

    const contextValue: IUserManagementContext = {
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        clearError: auth.clearError,
        updateProfile: auth.updateProfile,
        changePassword: auth.changePassword,
    };

    return <UserManagementContext.Provider value={contextValue}>{children}</UserManagementContext.Provider>;
};

export const useUserManagement = (): IUserManagementContext => {
    const context = useContext(UserManagementContext);
    if (context === undefined) {
        throw new Error('useUserManagement must be used within a UserManagementProvider');
    }
    return context;
};