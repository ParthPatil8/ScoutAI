import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/ToastContainer';
import { NewPlayerModal } from '../players/NewPlayerModal';

import { useApp } from '../../context/AppContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isNewPlayerModalOpen, openNewPlayerModal, closeNewPlayerModal } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-scout-bg text-gray-200 flex flex-col font-sans selection:bg-scout-neon selection:text-black">
      {/* Toast Alert Notifications */}
      <ToastContainer />

      {/* Cricketer Registration Modal */}
      <NewPlayerModal 
        isOpen={isNewPlayerModalOpen} 
        onClose={closeNewPlayerModal} 
      />

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-scout-bg border-r border-scout-border flex flex-col">
            <Sidebar 
              collapsed={false} 
              setCollapsed={() => setMobileSidebarOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Main Viewport Shell */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Sticky Topbar */}
        <Topbar 
          onOpenNewPlayerModal={openNewPlayerModal}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Scrollable Screen Workspace */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Professional Footer */}
        <footer className="border-t border-scout-card/60 py-4 px-6 text-center text-xs text-scout-muted font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-scout-neon rounded-full"></span>
            <span>ScoutAI • AI-Powered Cricket Talent Scouting & Biomechanics Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>FastAPI Backend + SQLAlchemy 2.0</span>
            <span>•</span>
            <span>MediaPipe & OpenCV Kinematics</span>
            <span>•</span>
            <span>v1.0.0 Pro</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
