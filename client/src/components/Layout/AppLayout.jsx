import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

const pageTitles = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/goals': 'Goals',
  '/insights': 'Insights',
  '/profile': 'Profile',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Dynamic title based on current route
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      {/* Hover trigger zone — invisible strip on the left edge */}
      <div
        className="sidebar-trigger"
        onMouseEnter={() => setSidebarOpen(true)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="app-main">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="app-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
