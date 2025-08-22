// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/PrivateHomePage.css';

const PrivateHomePage = () => {
  const { user, logout, isAuthenticated, isCuidador} = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    ubicacion: '',
    tipoAlojamiento: '',
    tarifaMax: '',
    exotico: false,
    cantAnimales: ''
  });

  const API_BASE_URL = 'http://localhost:3000/api';

  // Cargar todas las publicaciones
  useEffect(() => {
    fetchPublicaciones();
  }, []);

 const fetchPublicaciones = async () => {
  setLoading(true);
  setError('');
  try {
    // Construir parámetros de filtro
    const params = new URLSearchParams();
    if (filtros.ubicacion) params.append('ubicacion', filtros.ubicacion);
    if (filtros.tipoAlojamiento) params.append('tipoAlojamiento', filtros.tipoAlojamiento);
    if (filtros.tarifaMax) params.append('tarifaMax', filtros.tarifaMax);
    if (filtros.exotico) params.append('exotico', filtros.exotico);
    if (filtros.cantAnimales) params.append('cantAnimales', filtros.cantAnimales);

    const url = `${API_BASE_URL}/publicacion${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    setPublicaciones(
      Array.isArray(data.publicaciones)
        ? data.publicaciones
        : Array.isArray(data)
          ? data
          : []
    );
  } catch (err) {
    setError('Error al cargar publicaciones: ' + err.message);
    setPublicaciones([]); 
  } finally {
    setLoading(false);
  }
};
    

  // Aplicar filtros
  useEffect(() => {
    fetchPublicaciones();
  }, [filtros]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearFilters = () => {
    setFiltros({
      ubicacion: '',
      tipoAlojamiento: '',
      tarifaMax: '',
      exotico: false,
      cantAnimales: ''
    });
  };

  const handleUserMenuClick = () => {
    if (user) {
      if (user.tipoUsuario === 'cuidador') {
        navigate('/dashboards/cuidador');
      } else if (user.tipoUusario === 'dueno' || user.tipoUsuario === 'dueño') {
        navigate('/dashboards/dueno');
      }
    } else {
      navigate('/login');
    }
  };

  const handleReservar = (publicacionId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isCuidador=== 'cuidador') {
      alert('Los cuidadores no pueden hacer reservas');
      return;
    }

    // Redirigir a página de reserva o abrir modal
    navigate(`/reservar/${publicacionId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="homepage-navbar">
        <div className="navbar-brand">
          <h1 onClick={() => navigate('/')} className="brand-title">
            🐈Petsbnb
          </h1>
        </div>

        {/* Filtros de búsqueda */}
        <div className="search-filters">
          <input
            type="text"
            name="ubicacion"
            placeholder="📍 Ubicación"
            value={filtros.ubicacion}
            onChange={handleFilterChange}
            className="filter-input"
          />
          
          <select
            name="tipoAlojamiento"
            value={filtros.tipoAlojamiento}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Tipo de alojamiento</option>
            <option value="casa">En mi casa</option>
            <option value="domicilio">En casa del dueño</option>
            <option value="ambos">Ambos</option>
          </select>

          <input
            type="number"
            name="tarifaMax"
            placeholder="💰 Tarifa máxima"
            value={filtros.tarifaMax}
            onChange={handleFilterChange}
            className="filter-input"
          />

          <input
            type="number"
            name="cantAnimales"
            placeholder="🐕 Cantidad animales"
            value={filtros.cantAnimales}
            onChange={handleFilterChange}
            className="filter-input"
          />

          <label className="checkbox-filter">
            <input
              type="checkbox"
              name="exotico"
              checked={filtros.exotico}
              onChange={handleFilterChange}
            />
            <span>🦎 Exóticos</span>
          </label>

          <button onClick={clearFilters} className="clear-filters-btn">
            🗑️ Limpiar
          </button>
        </div>

        {/* User menu */}
        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-menu-button"
              >
                <div className="user-avatar">
                  {user?.nombre?.charAt(0).toUpperCase() || '👤'}
                </div>
                <span className="user-name">{user?.nombre}</span>
                <span className="user-type">({user?.tipoUsuario})</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <button 
                    onClick={handleUserMenuClick}
                    className="dropdown-item"
                  >
                    📊 Mi Dashboard
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                onClick={() => navigate('/login')}
                className="login-btn"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="register-btn"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="homepage-main">
        <div className="hero-section">
          <h2 className="hero-title">
            Encuentra el cuidador perfecto para tu mascota
          </h2>
          <p className="hero-subtitle">
            Miles de cuidadores verificados listos para cuidar a tu mejor amigo
          </p>
        </div>

        {/* Estado de carga y errores */}
        {loading && (
          <div className="loading-section">
            <div className="loading-spinner">🔄</div>
            <p>Cargando publicaciones...</p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <p>⚠️ {error}</p>
            <button onClick={fetchPublicaciones} className="retry-btn">
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de publicaciones */}
        {!loading && publicaciones.length === 0 ? (
          <div className="empty-state">
            <h3>                                                                                                                                                                                  No se encontraron publicaciones</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
        
          </div>
        ) : (
          <div className="publicaciones-grid">
            { Array.isArray(publicaciones) && publicaciones.map((pub) => (
              <div key={pub.id} className="publicacion-card">
                <div className="card-header">
                  <h3 className="card-title">{pub.titulo}</h3>
                  <div className="cuidador-info">
                    <span className="cuidador-name">
                      Por: {pub.cuidador?.nombre || 'Cuidador'}
                    </span>
                  </div>
                </div>

                <p className="card-description">{pub.descripcion}</p>

                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">📍 Ubicación:</span>
                    <span>{pub.ubicacion}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🏠 Tipo:</span>
                    <span>{pub.tipoAlojamiento}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🐕 Max animales:</span>
                    <span>{pub.cantAnimales}</span>
                  </div>
                  {pub.exotico && (
                    <div className="exotic-badge">
                      🦎 Acepta mascotas exóticas
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <div className="price-section">
                    <span className="price">${pub.tarifaPorDia}</span>
                    <span className="price-period">/ día</span>
                  </div>

                  <div className="card-actions">
                    {!isAuthenticated ? (
                      <button 
                        onClick={() => navigate('/login')}
                        className="reserve-btn"
                      >
                        Iniciar sesión para reservar
                      </button>
                    ) : isCuidador ? (
                      <button 
                        className="reserve-btn disabled"
                        title="Los cuidadores no pueden hacer reservas"
                        disabled
                      >
                        Solo para dueños
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReservar(pub.id)}
                        className="reserve-btn"
                      >
                        🎯 Reservar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PrivateHomePage;