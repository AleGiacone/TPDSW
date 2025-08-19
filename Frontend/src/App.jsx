
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';


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
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Rutas protegidas para Cuidadores */}
            <Route 
              path="/dashboard/cuidador/*" 
              element={
                <ProtectedRoute requiredUserType="cuidador">
                  <CuidadorDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Rutas protegidas para Dueños */}
            <Route 
              path="/dashboard/dueno/*" 
              element={
                <ProtectedRoute requiredUserType="dueno">
                  <DuenoDashboard />
                </ProtectedRoute>
              } 
            />

            {/* por defecto*/}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/cuidador" replace />
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



/*
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import Navbar from './components/Navbar';
import RegisterPage from './views/RegisterPage';
import CuidadorDashboard from "./views/dashboards/CuidadorDashboard";




function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<CuidadorDashboard />} />
          
          
        </Routes>
      </BrowserRouter>
  );
}



export default App;

*/