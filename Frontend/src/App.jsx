
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import HomePage from './views/principal/HomePage';
import LoginPage from './views/principal/LoginPage';
import RegisterPage from './views/principal/RegisterPage';
import PrivateHomePage from './views/homePrivado/PrivateHomePage';

import CuidadorDashboard from './views/dashboards/CuidadorDashboard';
import DuenoDashboard from './views/dashboards/DuenoDashboard';


const UnauthorizedPage = () => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <h2>No autorizado</h2>
    <p>No tienes permisos para acceder a esta página</p>
    <a href="/">Volver al inicio</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Páginas principales con Navbar */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <HomePage />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <Navbar />
                  <LoginPage />
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <Navbar />
                  <RegisterPage />
                </>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <>
                  <Navbar />
                  <UnauthorizedPage />
                </>
              }
            />

              <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredUserType={["cuidador", "dueno"]}>
                  <>
                    <PrivateHomePage /> 
                  </>
                </ProtectedRoute>
              }
            />


            {/* Dashboard cuidador */}
            <Route
              path="/dashboards/cuidador/*"
              element={
                <ProtectedRoute requiredUserType="cuidador">
                  <>
                    <CuidadorDashboard />
                  </>
                </ProtectedRoute>
              }
            />

            {/* Dashboard dueno */}
             <Route
              path="/dashboards/dueno/*"
              element={
                <ProtectedRoute requiredUserType="dueno">
                  <>
                    <DuenoDashboard />
                  </>
                </ProtectedRoute>
              }
            />

            {/* Ruta catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


