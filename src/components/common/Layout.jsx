import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-sidebar-overlay d-md-none" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="p-4">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default Layout;