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

// ✅ SOLUCIÓN: DEFINICIÓN DEL COMPONENTE FALTANTE
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
  
  {/* 1. RUTA RAÍZ: Muestra Publicaciones (Mantiene Navbar pública) */}
  <Route path="/" element={<><Navbar /><PublicacionesView /></>} />
  {/* 2. NUEVA RUTA: Muestra la página estática "Nosotros" */}
  <Route path="/nosotros" element={<><Navbar /><HomePage /></>} />
  {/* 3. Rutas de Autenticación (Mantiene Navbar pública) */}
  <Route path="/login" element={<><Navbar /><LoginPage /></>} />
  <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
  {/* Esta línea ahora funciona porque el componente está definido arriba */}
  <Route path="/unauthorized" element={<><Navbar /><UnauthorizedPage /></>} /> 
  
  {/* 4. Rutas de DASHBOARD (protegidas) */}
  <Route
   path="/dashboards/cuidador/*"
   element={<ProtectedRoute requiredUserType="cuidador"><CuidadorDashboard /></ProtectedRoute>} 
  />
  <Route
   path="/dashboards/dueno/*"
   element={<ProtectedRoute requiredUserType="dueno"><DuenoDashboard /></ProtectedRoute>} 
  />
  
  {/* 5. Ruta catch-all */}
  <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  </div>
 </Router>
 </AuthProvider>
);
}

export default App;