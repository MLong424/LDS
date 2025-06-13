// src/routes/managerRoutes.tsx
import { Navigate, Outlet } from 'react-router-dom';
import ManagerLayout from '@/components/manager/layout/ManagerLayout';
import { ProtectedRoute } from './protectedRoute';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import ManagerDashboard from '@pages/manager/Dashboard/ManagerDashboard';
import PendingOrderList from '@/pages/manager/Orders/PendingOrderList';
import OrderDetails from '@/pages/manager/Orders/OrderDetails';
import ProductList from '@/pages/manager/Products/ProductList';
import ProductDetails from '@/pages/manager/Products/ProductDetails';
import AddProduct from '@/pages/manager/Products/AddProduct';


const managerRoutes = [
    {
        path: '/manager',
        element: (
            <ProtectedRoute roles={['PRODUCT_MANAGER']}>
                <TooltipProvider>
                    <ManagerLayout>
                        <Outlet />
                    </ManagerLayout>
                </TooltipProvider>
            </ProtectedRoute>
        ),
        children: [
            {
                path: '',
                element: <Navigate to="dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <ManagerDashboard />,
            },
            // Pending Orders routes
            {
                path: 'orders',
                element: <Outlet />,
                children: [
                    {
                        path: '',
                        element: <PendingOrderList />,
                    },
                    {
                        path: ':id',
                        element: <OrderDetails />,
                    },
                ],
            },
            {
                path: 'catalog',
                element: <Outlet />,
                children: [
                    {
                        path: '',
                        element: <ProductList />,
                    },
                    {
                        path: 'add',
                        element: <AddProduct />,
                    },
                    
                    {
                        path: ':id/details',
                        element: <ProductDetails />,
                    },
                    
                ],
            },
            
        ],
    },
];

export default managerRoutes;
