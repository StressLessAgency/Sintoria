import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { ToastContainer } from './components/ui/index';
import AccessGate from './components/AccessGate';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
import Room from './pages/Room';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-txt-muted font-mono text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user?.isAdmin) return <Navigate to="/lobby" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-void grain-overlay">
      {children}
    </div>
  );
}

export default function App() {
  // Initialize socket connection when authenticated
  useSocket();

  return (
    <AccessGate>
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/room/:roomId" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </Layout>
    </AccessGate>
  );
}
