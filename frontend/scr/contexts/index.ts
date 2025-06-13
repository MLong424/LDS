// Legacy exports for backward compatibility
export { AuthProvider, useAuthContext } from './AuthContext';

// New segregated context exports
export { UserAuthProvider, useUserAuth } from './UserAuthContext';
export { UserRegistrationProvider, useUserRegistration } from './UserRegistrationContext';
export { UserManagementProvider, useUserManagement } from './UserManagementContext';
export { AdminProvider, useAdmin } from './AdminContext';

// Interface exports
export * from './interfaces/IAuthContext';

// Other context exports
export * from './CartContext';
export * from './OrderContext';
export * from './PaymentContext';
export * from './ProductContext';