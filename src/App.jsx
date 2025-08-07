import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { SupplierProvider } from './contexts/SupplierContext';
import { OrderProvider } from './contexts/OrderContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import SuppliersPage from './pages/SuppliersPage';
import OrdersPage from './pages/OrdersPage';
import SettingsPage from './pages/SettingsPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/custom.css';

// Smart redirect component for authenticated users
const AuthenticatedRedirect = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }
  
  return currentUser ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

// 404 Not Found component
const NotFound = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="mb-4 text-muted">The page you're looking for doesn't exist.</p>
        <Navigate to={currentUser ? "/dashboard" : "/"} replace />
      </div>
    </div>
  );
};

// Login redirect component to prevent authenticated users from accessing login
const LoginRedirect = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }
  
  return currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <SupplierProvider>
        <ProductProvider>
          <OrderProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <div className="App">
                <Toaster position="top-right" />
                <Routes>
                  {/* Root path - shows landing page or redirects to dashboard */}
                  <Route path="/" element={<AuthenticatedRedirect />} />
                  
                  {/* Login route with redirect for authenticated users */}
                  <Route path="/login" element={<LoginRedirect />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <InventoryPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/suppliers" element={
                    <ProtectedRoute>
                      <SuppliersPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route for 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </OrderProvider>
        </ProductProvider>
      </SupplierProvider>
    </AuthProvider>
  );
}

export default App;
