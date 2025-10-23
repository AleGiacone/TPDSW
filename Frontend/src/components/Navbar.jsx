import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const navbarClass = isAuthPage ? 'navbar auth-navbar' : 'navbar';
   const isHomePage = location.pathname === '/nosotros';
  
  const getDashboardPath = () => {
    if (!user) return '/login';
    const tipo = user.tipoUsuario?.toLowerCase();
    if (tipo === 'cuidador') return '/dashboards/cuidador';
    if (tipo === 'dueno' || tipo === 'dueño' || tipo === 'duenio') return '/dashboards/dueno';
    return '/';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

    return (
    <div className="layout-wrapper">
      <nav className={navbarClass}>
        <div className="navbar-logo">
          <NavLink to="/nosotros" className="logo-link">
            🐈Petsbnb
          </NavLink>
        </div>
        
        <ul className="navbar-links">
          <li>
            <NavLink to="/" className="nav-link">
              Ver Publicaciones
            </NavLink>
          </li>
          
          {isAuthenticated ? (
            <div className="wrap-authenticated-user">
              <li>
                <NavLink to={getDashboardPath()} className="link-dashboard">
                  Mi Dashboard
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="link-logout-btn">
                  Cerrar Sesión
                </button>
              </li>
            </div>
          ) : (
            // Solo mostrar los botones si NO estamos en la homepage
            !isHomePage && (
              <>
                <li>
                  <NavLink to="/login" className="nav-link">
                    Iniciar Sesión
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/register" className="nav-link-register">
                    Registrarse
                  </NavLink>
                </li>
              </>
            )
          )}
        </ul>
      </nav>
    </div>
  );
}
