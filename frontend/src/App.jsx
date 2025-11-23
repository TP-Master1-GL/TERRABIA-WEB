import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddProduct from './pages/farmer/AddProduct';
import { PageLoader } from './components/common/LoadingSpinner';

// Composant de route protégée
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Composant pour rediriger vers le bon dashboard selon le rôle
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'farmer') {
    return <Navigate to="/farmer/dashboard" replace />;
  }
  
  return <Dashboard />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées - Dashboard général */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout><DashboardRouter /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Routes agriculteurs */}
          <Route 
            path="/farmer/dashboard" 
            element={
              <ProtectedRoute>
                <Layout><FarmerDashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/farmer/products/new" 
            element={
              <ProtectedRoute>
                <Layout><AddProduct /></Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Route de fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;