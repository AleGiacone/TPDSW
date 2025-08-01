// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css'; // Importamos los estilos

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">🐈Petsbnb</div>
      <ul className="navbar-links">
        <li><NavLink to="/" className="nav-link">Nosotros</NavLink></li>
        <li><NavLink to="/login" className="nav-link">Iniciar Sesión</NavLink></li>
        <li><NavLink to="/register" className="nav-link">Registrarse</NavLink></li>
      </ul>
    </nav>
  );
}
