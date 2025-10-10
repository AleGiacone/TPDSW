
// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || (requiredUserType && !requiredUserType.includes(user.tipoUsuario))) {
    return <Navigate to="/" replace />;
  }
  // Si requiere un tipo específico de usuario y no coincide
  {/*if (requiredUserType && user?.tipoUsuario !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }*/}

  return children;
};

export {ProtectedRoute};