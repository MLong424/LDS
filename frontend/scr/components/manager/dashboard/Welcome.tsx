import { useAuthContext } from '@/contexts/AuthContext';

const WelcomeManager = () => {
    const { user } = useAuthContext();
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name || 'Manager'}!</h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
            </div>
            <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    );
};
export default WelcomeManager;