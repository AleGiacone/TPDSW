import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import HomePage from './views/principal/HomePage'; 
import LoginPage from './views/principal/LoginPage';
import RegisterPage from './views/principal/RegisterPage';
import PublicacionesView from './views/homePrivado/PrivateHomePage'; 

import DuenoDashboard from './views/dashboards/DuenoDashboard';
import CuidadorDashboard from './views/dashboards/CuidadorDashboard';


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
 
  <Route path="/" element={<><Navbar /><PublicacionesView /></>} />
  <Route path="/nosotros" element={<><Navbar /><HomePage /></>} />
  <Route path="/login" element={<><LoginPage /></>} />
  <Route path="/register" element={<><RegisterPage /></>} />

  <Route path="/unauthorized" element={<><Navbar /><UnauthorizedPage /></>} /> 
  
  <Route
   path="/dashboards/cuidador/*"
   element={<ProtectedRoute requiredUserType="cuidador"><CuidadorDashboard /></ProtectedRoute>} 
  />
  <Route
   path="/dashboards/dueno/*"
   element={<ProtectedRoute requiredUserType="dueno"><DuenoDashboard /></ProtectedRoute>} 
  />
 
  <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  </div>
 </Router>
 </AuthProvider>
);
}

export default App;