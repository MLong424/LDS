import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@hooks/useAuth';
import { IUserRegistrationContext } from './interfaces/IAuthContext';

const UserRegistrationContext = createContext<IUserRegistrationContext | undefined>(undefined);

export const UserRegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();

    const contextValue: IUserRegistrationContext = {
        loading: auth.loading,
        error: auth.error,
        clearError: auth.clearError,
        register: auth.register,
        forgotPassword: auth.forgotPassword,
        resetPassword: auth.resetPassword,
    };

    return <UserRegistrationContext.Provider value={contextValue}>{children}</UserRegistrationContext.Provider>;
};

export const useUserRegistration = (): IUserRegistrationContext => {
    const context = useContext(UserRegistrationContext);
    if (context === undefined) {
        throw new Error('useUserRegistration must be used within a UserRegistrationProvider');
    }
    return context;
};