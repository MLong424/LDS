import './index.css';
import AppProvider from './AppProvider';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
export function App() {
    return (
        <AppProvider>
            <RouterProvider router={router} />
        </AppProvider>
    );
}

export default App;
