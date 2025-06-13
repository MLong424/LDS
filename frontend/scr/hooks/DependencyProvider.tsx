import React, { createContext, useContext, ReactNode } from 'react';
import { ApiServiceFactory } from '../api/factory/ApiServiceFactory';
import {
    IAuthService,
    IProductService,
    ICartService,
    IOrderService,
    IPaymentService,
} from '../api/interfaces/IApiService';

interface DependencyContextType {
    authService: IAuthService;
    productService: IProductService;
    cartService: ICartService;
    orderService: IOrderService;
    paymentService: IPaymentService;
}

const DependencyContext = createContext<DependencyContextType | undefined>(undefined);

interface DependencyProviderProps {
    children: ReactNode;
    services?: Partial<DependencyContextType>;
}

export const DependencyProvider: React.FC<DependencyProviderProps> = ({ 
    children, 
    services = {} 
}) => {
    const factory = ApiServiceFactory.getInstance();

    const defaultServices: DependencyContextType = {
        authService: factory.createAuthService(),
        productService: factory.createProductService(),
        cartService: factory.createCartService(),
        orderService: factory.createOrderService(),
        paymentService: factory.createPaymentService(),
    };

    const contextValue: DependencyContextType = {
        ...defaultServices,
        ...services,
    };

    return (
        <DependencyContext.Provider value={contextValue}>
            {children}
        </DependencyContext.Provider>
    );
};

export const useDependencies = (): DependencyContextType => {
    const context = useContext(DependencyContext);
    if (context === undefined) {
        throw new Error('useDependencies must be used within a DependencyProvider');
    }
    return context;
};

export const useServiceDependency = <T extends keyof DependencyContextType>(
    serviceName: T
): DependencyContextType[T] => {
    const dependencies = useDependencies();
    return dependencies[serviceName];
};