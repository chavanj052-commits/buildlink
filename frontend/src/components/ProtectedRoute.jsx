import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import API, { initSocket, disconnectSocket } from '../api';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider/ProtectedRoute');
  }
  return context;
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.get('/auth/me');
      setUser(data);
      initSocket();
    } catch (err) {
      console.error('Failed to authenticate token:', err);
      localStorage.removeItem('token');
      disconnectSocket();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    disconnectSocket();
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f1b2d',
        color: '#ffffff',
        gap: '16px'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '4px solid rgba(232, 168, 56, 0.2)',
          borderTopColor: '#e8a838',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#8899aa', fontSize: '14px', fontWeight: 500 }}>
          Loading BuildLink workspace...
        </p>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, refreshUser: fetchUser }}>
      {typeof children === 'function' ? children({ user }) : React.cloneElement(children, { user })}
    </AuthContext.Provider>
  );
}
