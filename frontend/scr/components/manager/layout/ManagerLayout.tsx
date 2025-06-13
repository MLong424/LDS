// src/components/manager/layout/ManagerLayout.tsx
import React, { ReactNode } from 'react';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';
interface ManagerLayoutProps {
    children: ReactNode;
}

const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <DesktopSidebar/>
            <MobileSidebar/>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header for mobile and notifications */}
                <Header/>

                {/* Main content area */}
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
};

export default ManagerLayout;
