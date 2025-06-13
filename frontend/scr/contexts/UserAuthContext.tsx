import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { IUserAuthContext } from './interfaces/IAuthContext';

const UserAuthContext = createContext<IUserAuthContext | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();

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

    const contextValue: IUserAuthContext = {
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        clearError: auth.clearError,
        login: auth.login,
        logout: auth.logout,
        getProfile: auth.getProfile,
    };

    return <UserAuthContext.Provider value={contextValue}>{children}</UserAuthContext.Provider>;
};

export const useUserAuth = (): IUserAuthContext => {
    const context = useContext(UserAuthContext);
    if (context === undefined) {
        throw new Error('useUserAuth must be used within a UserAuthProvider');
    }
    return context;
};