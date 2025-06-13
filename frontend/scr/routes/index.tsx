// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import adminRoutes from './adminRoutes';
import clientRoutes from './clientRoutes';
import managerRoutes from './managerRoutes';

// Combine all routes
const routes = [
  ...clientRoutes,
  ...adminRoutes,
  ...managerRoutes
];

// Create the router with all routes
const router = createBrowserRouter(routes);

export default router;