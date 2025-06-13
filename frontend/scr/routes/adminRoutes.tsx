// src/routes/adminRoutes.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './protectedRoute';
import AdminDashboard from '@/pages/admin/Dashboard/AdminDashboard';
import UserManagement from '@/pages/admin/Users/UserManagement';
import SystemSettings from '@/pages/admin/Settings/SystemSettings';

const adminRoutes = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute roles={['ADMIN']}>
                <Outlet />
            </ProtectedRoute>
        ),
        children: [
            {
                path: '',
                element: <Navigate to="dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <AdminDashboard />,
            },
            {
                path: 'users',
                element: <UserManagement />,
            },
            {
                path: 'settings',
                element: <SystemSettings />,
            },
        ],
    },
];

export default adminRoutes;
