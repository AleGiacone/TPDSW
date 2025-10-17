import React from 'react';
import { NavLink, useLocation } from 'react-router-dom'; // 👈 Añadir useLocation
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.css';

export default function Navbar() {
 const { isAuthenticated, user, logout } = useAuth();
 const location = useLocation(); // 👈 Obtener la ruta actual
 
 // Detectar si estamos en una página de autenticación
 const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
 
 // Clase condicional para el contenedor de la navbar
 const navbarClass = isAuthPage ? 'navbar auth-navbar' : 'navbar'; 
 // Función auxiliar para obtener la ruta del dashboard
 const getDashboardPath = () => {
  if (!user) return '/login'; 
  const tipo = user.tipoUsuario?.toLowerCase();
  if (tipo === 'cuidador') return '/dashboards/cuidador';
  if (tipo === 'dueno' || tipo === 'dueño' || tipo === 'duenio') return '/dashboards/dueno';
  return '/'; // Fallback
 };
 const handleLogout = async () => {
  try {
   await logout();
  } catch (err) {
   console.error('Error al cerrar sesión:', err);
  }
 };
 return (
  <div className="page-wrapper">
  <div className="layout-wrapper">
  <nav className={navbarClass}> {/* 👈 CLASE CONDICIONAL AQUÍ */}
   <div className="navbar-logo">
    <NavLink to="/nosotros" className="logo-link">
    🐈Petsbnb
    </NavLink>
   </div>
   <ul className="navbar-links">
  <li><NavLink to="/" className="nav-link">Ver Publicaciones</NavLink></li>
  
  {isAuthenticated ? (
   // Si está autenticado, muestra el Dashboard y Cerrar Sesión
   <>
    <div className= "wrap-authenticated-user">
    <li><NavLink to={getDashboardPath()} className="link-dashboard">Mi Dashboard</NavLink></li>
    <li>
     <button 
      onClick={handleLogout} 
      className="link-logout-btn" 
      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
     >
     Cerrar Sesión
     </button>
    </li>
    </div>
   </>
  ) : (
   // Si NO está autenticado, muestra Iniciar Sesión y Registrarse
   <>
    <li><NavLink to="/login" className="nav-link">Iniciar Sesión</NavLink></li>
    <li><NavLink to="/register" className="nav-link register">Registrarse</NavLink></li>
   </>
  )}
   </ul>
  </nav>
  </div>
</div>
 );
}