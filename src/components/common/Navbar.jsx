import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import AlertBadge from './AlertBadge';

const Navbar = ({ toggleSidebar }) => {
  const { currentUser, userRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true }); // Redirect to landing page
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getPageTitle = () => {
    const titles = {
      '/dashboard': 'Dashboard',
      '/inventory': 'Inventory Management',
      '/suppliers': 'Supplier Management',
      '/orders': 'Order Management',
      '/settings': 'Settings'
    };
    return titles[location.pathname] || 'Dashboard';
  };

  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom px-3 py-2">
      <div className="d-flex align-items-center w-100">
        {/* Mobile menu toggle */}
        <Button
          variant="outline-secondary"
          className="d-md-none me-3"
          onClick={toggleSidebar}
        >
          <i className="bi bi-list"></i>
        </Button>

        {/* Dynamic page title */}
        <div className="flex-grow-1">
          <h4 className="mb-0 text-dark">{getPageTitle()}</h4>
        </div>

        {/* Right side navigation */}
        <Nav className="ms-auto align-items-center">
          {/* Alert Badge */}
          <AlertBadge />
          
          {/* User Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center">
              <i className="bi bi-person-circle me-2"></i>
              <span className="d-none d-sm-inline">
                {currentUser?.displayName || currentUser?.email}
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Header>
                <div className="fw-bold">{currentUser?.displayName || 'User'}</div>
                <small className="text-muted">{currentUser?.email}</small>
                <small className="badge bg-primary ms-2">{userRole}</small>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/settings">
                <i className="bi bi-person me-2"></i>
                Profile
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/settings">
                <i className="bi bi-gear me-2"></i>
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </div>
    </BootstrapNavbar>
  );
};

export default Navbar;