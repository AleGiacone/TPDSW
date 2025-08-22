
import React, { useState, useEffect } from 'react';
//import './CuidadorDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import '../../styles/DashboardCuidador.css'


const CuidadorDashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('publicaciones');
  const [publicaciones, setPublicaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
    
  const API_BASE_URL = 'http://localhost:3000/api';

  // Estado para el formulario de nueva publicación
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tarifaPorDia: '',
    ubicacion: '',
    tipoAlojamiento: '',
    cantAnimales: '',
    exotico: false
  });

  // Cargar publicaciones del cuidador
  useEffect(() => {
    if (user?.id) {
      fetchPublicaciones();
    }
  }, [user?.id]);

  // Cargar reservas del cuidador
  useEffect(() => {
    const fetchReservas = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/reserva/cuidador/${user.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setReservas(data.reservas || data || []);
        }
      } catch (err) {
        console.error('Error al cargar reservas:', err);
        
      }
    };

    
  if (loading) {
  return <div className="loading-message">Cargando...</div>;
     }

  if (!user) {
  return <Navigate to="/login" replace />;
}

    if (user?.id) {
      fetchReservas();
    }
  }, [user?.id]);

  const fetchPublicaciones = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/publicacion/cuidador/${user.id}`, {
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
      setPublicaciones(data.publicaciones || data || []);
    } catch (err) {
      setError('Error al cargar publicaciones: ' + err.message);
      console.error('Error al cargar publicaciones:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/publicacion`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          cuidadorId: user.id 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const nuevaPublicacion = await response.json();
      
      // Actualizar la lista de publicaciones
      setPublicaciones(prev => [...prev, nuevaPublicacion]);
      
      // Limpiar formulario
      setFormData({
        titulo: '',
        descripcion: '',
        tarifaPorDia: '',
        ubicacion: '',
        tipoAlojamiento: '',
        cantAnimales: '',
        exotico: false
      });
      
      // Cambiar vista a publicaciones
      setCurrentView('publicaciones');
      
      alert('Publicación creada exitosamente!');
    } catch (err) {
      setError('Error al crear publicación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      alert('Sesión cerrada');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const deletePublicacion = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/publicacion/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      setPublicaciones(prev => prev.filter(pub => pub.id !== id));
      alert('Publicación eliminada exitosamente');
    } catch (err) {
      alert('Error al eliminar publicación: ' + err.message);
    }
  };

  const updateReservaEstado = async (reservaId, nuevoEstado) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reserva/${reservaId}/estado`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      // Actualizar el estado local
      setReservas(prev => 
        prev.map(reserva => 
          reserva.id === reservaId 
            ? { ...reserva, estado: nuevoEstado }
            : reserva
        )
      );
      
      alert(`Reserva ${nuevoEstado === 'confirmada' ? 'aceptada' : 'rechazada'} exitosamente`);
    } catch (err) {
      alert('Error al actualizar reserva: ' + err.message);
    }
  };

  const renderPublicaciones = () => (
    <div className="dashboard-main">
      <div className="publicaciones-header">
        <h2 className="section-title">Mis Publicaciones</h2>
        <button
          onClick={() => setCurrentView('nueva-publicacion')}
          className="btn-primary"
        >
          + Nueva Publicación
        </button>
      </div>

      {loading && <div className="loading-message">Cargando publicaciones...</div>}
      
      {error && <div className="error-message">{error}</div>}

      {publicaciones.length === 0 && !loading ? (
        <div className="empty-state">
          <p>Aún no tienes publicaciones</p>
        </div>
      ) : (
        <div className="publicaciones-grid">
          {publicaciones.map((pub) => (
            <div key={pub.id} className="publicacion-card">
              <h3 className="card-title">{pub.titulo}</h3>
              <p className="card-description">{pub.descripcion}</p>
              <div className="card-info">
                <div className="price-location">
                  <span className="price">
                    ${pub.tarifaPorDia}/día
                  </span>
                  <span className="location">📍 {pub.ubicacion}</span>
                </div>
                <div className="card-details">
                  <span>Tipo: {pub.tipoAlojamiento} | Max animales: {pub.cantAnimales}</span>
                  {pub.exotico && <span className="exotic-badge"> | Acepta exóticos</span>}
                </div>
              </div>
              <div className="card-buttons">
                <button className="btn-edit">
                  Editar
                </button>
                <button 
                  onClick={() => deletePublicacion(pub.id)}
                  className="btn-delete"
                >
                  Eliminar
                </button>
                <button className="btn-reservas">
                  Ver Reservas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReservas = () => (
    <div className="dashboard-main">
      <h2 className="section-title">Mis Reservas</h2>
      {reservas.length === 0 ? (
        <p className="loading-message">No tienes reservas aún</p>
      ) : (
        <div className="reservas-grid">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="reserva-card">
              <div className="reserva-info">
                <h3>{reserva.publicacion}</h3>
                <p><strong>Dueño:</strong> {reserva.dueno}</p>
                <p><strong>Mascota:</strong> {reserva.mascota}</p>
                <p>
                  <strong>Fechas:</strong> {reserva.fechaInicio} - {reserva.fechaFin}
                </p>
                <p><strong>Total:</strong> ${reserva.total}</p>
              </div>
              <div className="reserva-status">
                <span className={`status-badge status-${reserva.estado}`}>
                  {reserva.estado.toUpperCase()}
                </span>
                {reserva.estado === 'pendiente' && (
                  <div className="reserva-actions">
                    <button 
                      onClick={() => updateReservaEstado(reserva.id, 'confirmada')}
                      className="btn-accept"
                    >
                      Aceptar
                    </button>
                    <button 
                      onClick={() => updateReservaEstado(reserva.id, 'rechazada')}
                      className="btn-reject"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPerfil = () => (
    <div className="dashboard-main">
      <div className="perfil-container">
        <h2 className="section-title">Mi Perfil</h2>
        <div className="perfil-card">
          <div className="perfil-field">
            <label className="field-label">Nombre:</label>
            <p className="field-value">{user?.nombre}</p>
          </div>
          <div className="perfil-field">
            <label className="field-label">Email:</label>
            <p className="field-value">{user?.email}</p>
          </div>
          <div className="perfil-field">
            <label className="field-label">Teléfono:</label>
            <p className="field-value">{user?.telefono}</p>
          </div>
          <div className="perfil-field">
            <label className="field-label">Descripción:</label>
            <p className="field-value field-description">
              {user?.descripcion || 'Sin descripción personalizada'}
            </p>
          </div>
          <button className="btn-primary">
            Editar Perfil
          </button>
        </div>
      </div>
    </div>
  );

  const renderNuevaPublicacion = () => (
    <div className="dashboard-main">
      <div className="form-container">
        <h2 className="section-title">Nueva Publicación</h2>
        
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label className="form-label">
              Título:
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Descripción:
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              required
              className="form-textarea"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Tarifa por día ($):
              </label>
              <input
                type="number"
                name="tarifaPorDia"
                value={formData.tarifaPorDia}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Cantidad de animales:
              </label>
              <input
                type="number"
                name="cantAnimales"
                value={formData.cantAnimales}
                onChange={handleChange}
                min="1"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Ubicación:
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Tipo de alojamiento:
            </label>
            <select
              name="tipoAlojamiento"
              value={formData.tipoAlojamiento}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Seleccionar...</option>
              <option value="casa">En mi casa</option>
              <option value="domicilio">En casa del dueño</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-group">
              <input
                type="checkbox"
                name="exotico"
                checked={formData.exotico}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span>Acepto mascotas exóticas</span>
            </label>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-buttons">
            <button 
              type="button" 
              onClick={() => setCurrentView('publicaciones')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Publicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!user) {
    return <div className="loading-message">Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Navbar del dashboard */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <h1 className="navbar-title">PetsBnB - Cuidador</h1>
          <span className="navbar-welcome">Bienvenido, {user?.nombre}</span>
        </div>
        
        <div className="navbar-buttons">
          <button
            onClick={() => setCurrentView('publicaciones')}
            className={`nav-button ${currentView === 'publicaciones' ? 'active' : ''}`}
          >
            Mis Publicaciones
          </button>
          <button
            onClick={() => setCurrentView('reservas')}
            className={`nav-button ${currentView === 'reservas' ? 'active' : ''}`}
          >
            Reservas
          </button>
          <button
            onClick={() => setCurrentView('perfil')}
            className={`nav-button ${currentView === 'perfil' ? 'active' : ''}`}
          >
            Mi Perfil
          </button>
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main>
        {currentView === 'publicaciones' && renderPublicaciones()}
        {currentView === 'reservas' && renderReservas()}
        {currentView === 'perfil' && renderPerfil()}
        {currentView === 'nueva-publicacion' && renderNuevaPublicacion()}
      </main>
    </div>
  );
};

export default CuidadorDashboard;