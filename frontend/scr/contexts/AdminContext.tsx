import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@hooks/useAuth';
import { IAdminContext } from './interfaces/IAuthContext';

const AdminContext = createContext<IAdminContext | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();

    const contextValue: IAdminContext = {
        loading: auth.loading,
        error: auth.error,
        clearError: auth.clearError,
        getAllUsers: auth.getAllUsers,
        blockUser: auth.blockUser,
        setUserRoles: auth.setUserRoles,
    };

    return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
};

export const useAdmin = (): IAdminContext => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};