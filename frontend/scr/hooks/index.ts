// Legacy hooks
export { useAuth } from './useAuth';
export { useCart } from './useCart';
export { useOrder } from './useOrder';
export { usePayment } from './usePayment';
export { useProduct } from './useProduct';

// Base hook
export { useBaseHook } from './BaseHook';

// DI-enabled hooks
export { useAuthWithDI } from './useAuthWithDI';
export { useProductWithDI } from './useProductWithDI';

// Dependency injection
export { DependencyProvider, useDependencies, useServiceDependency } from './DependencyProvider';