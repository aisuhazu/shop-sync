import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { userRole } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      roles: ['admin', 'staff']
    },
    {
      path: '/inventory',
      icon: 'bi-box-seam',
      label: 'Inventory',
      roles: ['admin', 'staff']
    },
    {
      path: '/suppliers',
      icon: 'bi-truck',
      label: 'Suppliers',
      roles: ['admin', 'staff']
    },
    {
      path: '/orders',
      icon: 'bi-receipt',
      label: 'Orders',
      roles: ['admin', 'staff']
    },
    {
      path: '/settings',
      icon: 'bi-gear',
      label: 'Settings',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className={`sidebar ${isOpen ? 'show' : ''}`}>
      <div className="p-4">
        <Link to="/dashboard" className="text-decoration-none" onClick={onClose}>
          <h3 className="text-white mb-0">
            <i className="bi bi-shop me-2"></i>
            ShopSync
          </h3>
        </Link>
        <small className="text-light opacity-75">Inventory Management</small>
      </div>

      <Nav className="flex-column px-3">
        {filteredMenuItems.map((item) => (
          <Nav.Item key={item.path}>
            <Nav.Link
              as={Link}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <div className="mt-auto p-3">
        <div className="bg-primary bg-opacity-10 rounded p-3">
          <h6 className="text-white mb-2">
            <i className="bi bi-lightbulb me-2"></i>
            Need Help?
          </h6>
          <p className="text-light small mb-2">
            Check our documentation for guides and tutorials.
          </p>
          <button className="btn btn-outline-light btn-sm">
            View Docs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;