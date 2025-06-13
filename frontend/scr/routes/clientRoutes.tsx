// src/routes/clientRoutes.tsx
import { Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from './protectedRoute';
import { LoadingSpinner, AuthLayout } from '@components/common';
import { CustomerLayout, CustomerAccountLayout } from '@components/customer/layout';
import { Home, Login, Register, ResetPassword, ForgotPassword, About, Contact, NotFound } from '@pages/client';

const Shop = lazy(() => import('@pages/client/Shop/Shop'));
const ProductDetail = lazy(() => import('@pages/client/Shop/ProductDetail'));
const Cart = lazy(() => import('@pages/client/Cart/Cart'));
const Checkout = lazy(() => import('@pages/client/Checkout/Checkout'));
const OrderSuccess = lazy(() => import('@pages/client/Order/OrderSuccess'));
const PaymentError = lazy(() => import('@pages/client/Order/PaymentError'));
const AccountOverview = lazy(() => import('@pages/client/Account/AccountOverview'));
const OrderDetails = lazy(() => import('@pages/client/Account/OrderDetails'));
const OrdersList = lazy(() => import('@pages/client/Account/OrdersList'));

const clientRoutes = [
    {
        element: (
            <Suspense fallback={<LoadingSpinner fullPage message="Loading..." />}>
                <CustomerLayout>
                    <Outlet />
                </CustomerLayout>
            </Suspense>
        ),
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/about',
                element: <About />,
            },
            {
                path: '/contact',
                element: <Contact />,
            },
            {
                path: '/shop',
                element: <Shop />,
            },
            {
                path: '/product/:id',
                element: <ProductDetail />,
            },
            {
                path: '/order/confirmation/:id',
                element: <OrderSuccess />,
            },
            {
                path: '/payment/error',
                element: <PaymentError />,
            },
            {
                path: '*',
                element: <NotFound />,
            },
        ],
    },
    {
        element: (
            <AuthLayout>
                <Outlet />
            </AuthLayout>
        ),
        children: [
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/register',
                element: <Register />,
            },
            {
                path: '/forgot-password',
                element: <ForgotPassword />,
            },
            {
                path: '/reset-password',
                element: <ResetPassword />,
            },
            {
                path: '/cart',
                element: <Cart />,
            },
            {
                path: '/checkout',
                element: <Checkout />,
            },
        ],
    },
    {
        element: (
            <ProtectedRoute roles={['CUSTOMER']}>
                <CustomerAccountLayout>
                    <Outlet />
                </CustomerAccountLayout>
            </ProtectedRoute>
        ),
        children: [
            {
                path: '/account',
                element: <AccountOverview />,
            },
            {
                path: '/account/orders',
                element: <OrdersList />,
            },
            {
                path: '/account/orders/:id',
                element: <OrderDetails />,
            }
        ],
    },
];

export default clientRoutes;
