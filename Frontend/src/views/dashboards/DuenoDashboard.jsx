import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import '../../styles/DashboardDueno.css';

const DuenoDashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('mascotas');
  const [mascotas, setMascotas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [razasFiltradas, setRazasFiltradas] = useState([]);
  const API_BASE_URL = 'http://localhost:3000/api';
           
  const [mascotaForm, setMascotaForm] = useState({
    nombre: '',
    edad: '',
    sexo: '',
    exotico: false,
    descripcion: '',
    peso: '',
    idEspecie: '',
    idRaza: ''
  });


  const [especies, setEspecies] = useState([]);
  const [razas, setRazas] = useState([]);

  const [editingMascota, setEditingMascota] = useState(null);

  useEffect(() => {
    console.log('Estado especies actualizado:', especies);
  }, [especies]);

  useEffect(() => {
    console.log('Estado razas actualizado:', razas);
  }, [razas]);

  const [perfilForm, setPerfilForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    nroDocumento: user?.nroDocumento || '',
    tipoDocumento: user?.tipoDocumento || ''
  });
  const [editingPerfil, setEditingPerfil] = useState(false);


  useEffect(() => {
    if (user?.id) {
      fetchMascotas();
      fetchReservas();
      fetchEspecies();
      fetchRazas();
    }
  }, [user?.id]);


  useEffect(() => {
  if (mascotaForm.idEspecie) {
    const especieId = parseInt(mascotaForm.idEspecie);

    const razasDeEspecie = razas.filter(raza => 
      raza.especies?.some(especie => especie.idEspecie === especieId)
    );

    setRazasFiltradas(razasDeEspecie);
  } else {
    setRazasFiltradas([]);
  }
}, [mascotaForm.idEspecie, razas]);


  const fetchMascotas = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mascotas/duenos/${user.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMascotas(data.mascotas || data || []);
      }
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
      setError('Error al cargar mascotas');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservas = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/reservas/dueno/${user.id}`, {
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

  const fetchEspecies = async () => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/especies`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response especies:', response.status); 

      if (response.ok) {
        const data = await response.json();
        console.log('Datos especies:', data); 
        
        
        const especiesArray = data.especies || data.data || data || [];
        console.log('Especies array:', especiesArray); 
        setEspecies(especiesArray);
      } else {
        console.error('Error en respuesta especies:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error al cargar especies:', err);
    }
  };

  const fetchRazas = async () => {
    try {

      const response = await fetch(`${API_BASE_URL}/razas`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response razas:', response.status); 

      if (response.ok) {
        const data = await response.json();
        console.log('Datos razas:', data); 
        
       
        const razasArray = data.razas || data.data || data || [];
        console.log('Razas array:', razasArray); 
        setRazas(razasArray);
      } else {
        console.error('Error en respuesta razas:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error al cargar razas:', err);
    }
  };

  const handleMascotaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = editingMascota 
        ? `${API_BASE_URL}/mascotas/${editingMascota.id}`
        : `${API_BASE_URL}/mascotas`;
      
      const method = editingMascota ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
         credentials: 'include',
           headers: {
    'Content-Type': 'application/json'
  },
     body: JSON.stringify({
  nomMascota: mascotaForm.nombre,           
  edad: parseInt(mascotaForm.edad),         
  sexo: mascotaForm.sexo,
  exotico: mascotaForm.exotico,
  descripcion: mascotaForm.descripcion,
  peso: parseFloat(mascotaForm.peso),       
  especie: parseInt(mascotaForm.idEspecie), 
  raza: parseInt(mascotaForm.idRaza),      
  dueno: user.id      
  })
});


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const mascotaData = await response.json();
      
      if (editingMascota) {
        setMascotas(prev => 
          prev.map(m => m.id === editingMascota.id ? mascotaData : m)
        );
        alert('Mascota actualizada exitosamente!');
      } else {
        setMascotas(prev => [...prev, mascotaData]);
        alert('Mascota agregada exitosamente!');
      }
      
      // Limpiar formulario
      setMascotaForm({
        nombre: '',
        edad: '',
        sexo: '',
        exotico: false,
        descripcion: '',
        peso: '',
        idEspecie: '',
        idRaza: ''
      });
      setEditingMascota(null);
      setCurrentView('mascotas');
      
    } catch (err) {
      setError('Error al guardar mascota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePerfilSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(perfilForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      alert('Perfil actualizado exitosamente!');
      setEditingPerfil(false);
      
    } catch (err) {
      setError('Error al actualizar perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMascota = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta mascota?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mascotas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      setMascotas(prev => prev.filter(m => m.id !== id));
      alert('Mascota eliminada exitosamente');
    } catch (err) {
      alert('Error al eliminar mascota: ' + err.message);
    }
  };

  const startEditMascota = (mascota) => {
    setMascotaForm({
      nomMascota: mascota.nombre,
      edad: mascota.edad,
      sexo: mascota.sexo,
      exotico: mascota.exotico,
      descripcion: mascota.descripcion || '',
      peso: mascota.peso,
      especie: mascota.idEspecie.toString(),
      raza: mascota.idRaza.toString(),
      dueno: user.id
    });
    setEditingMascota(mascota);
    setCurrentView('nueva-mascota');
  };

  const handleMascotaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMascotaForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePerfilChange = (e) => {
    const { name, value } = e.target;
    setPerfilForm(prev => ({
      ...prev,
      [name]: value
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

  const cancelarReserva = async (reservaId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reserva/${reservaId}/estado`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'cancelada' })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      setReservas(prev => 
        prev.map(reserva => 
          reserva.id === reservaId 
            ? { ...reserva, estado: 'cancelada' }
            : reserva
        )
      );
      
      alert('Reserva cancelada exitosamente');
    } catch (err) {
      alert('Error al cancelar reserva: ' + err.message);
    }
  };

  const renderMascotas = () => (
    <div className="dashboard-main">
      <div className="mascotas-header">
        <h2 className="section-title">Mis Mascotas</h2>
        <button
          onClick={() => setCurrentView('nueva-mascota')}
          className="btn-primary"
        >
          + Agregar Mascota
        </button>
      </div>

      {loading && <div className="loading-message">Cargando mascotas...</div>}
      
      {error && <div className="error-message">{error}</div>}

      {mascotas.length === 0 && !loading ? (
        <div className="empty-state">
          <p>Aún no tienes mascotas registradas</p>
        </div>
      ) : (
        <div className="mascotas-grid">
          {mascotas.map((mascota) => (
            <div key={mascota.id} className="mascota-card">
              <div className="mascota-avatar">
                {mascota.exotico ? '🦎' : '🐕'}
              </div>
              <div className="mascota-info">
                <h3 className="mascota-name">{mascota.nombre}</h3>
                <div className="mascota-details">
                  <p><strong>Especie:</strong> {mascota.especie?.nombre}</p>
                  <p><strong>Raza:</strong> {mascota.raza?.nombre}</p>
                  <p><strong>Edad:</strong> {mascota.edad} años</p>
                  <p><strong>Sexo:</strong> {mascota.sexo}</p>
                  <p><strong>Peso:</strong> {mascota.peso} kg</p>
                  {mascota.exotico && <span className="exotic-badge">Exótica</span>}
                </div>
                {mascota.descripcion && (
                  <p className="mascota-description">{mascota.descripcion}</p>
                )}
              </div>
              <div className="mascota-actions">
                <button 
                  onClick={() => startEditMascota(mascota)}
                  className="btn-edit"
                >
                  Editar
                </button>
                <button 
                  onClick={() => deleteMascota(mascota.id)}
                  className="btn-delete"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNuevaMascota = () => (
    <div className="dashboard-main">
      <div className="form-container">
        <h2 className="section-title">
          {editingMascota ? 'Editar Mascota' : 'Agregar Nueva Mascota'}
        </h2>
        
        <form onSubmit={handleMascotaSubmit} className="form-card">
          <div className="form-group">
            <label className="form-label">Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={mascotaForm.nombre}
              onChange={handleMascotaChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
              <label className="form-label">Raza:</label>
              <select
                name="idRaza"
                value={mascotaForm.idRaza}
                onChange={handleMascotaChange}
                required
                className="form-select"
                disabled={!mascotaForm.idEspecie}
              >
                <option value="">Seleccionar raza...</option>
                {razasFiltradas.map((raza) => (
                  <option key={raza.id} value={raza.id}>
                    {raza.nombre}
                  </option>
                ))}
              </select>
 </div>
   <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Especie:</label>
              <select
                name="idEspecie"
                value={mascotaForm.idEspecie}
                onChange={handleMascotaChange}
                required
                className="form-select"
              >
                <option value="">Seleccionar especie...</option>
                {especies.map((especie) => (
                  <option key={especie.id} value={especie.id}>
                    {especie.nombre}
                  </option>
                ))}
              </select>
            </div>

           
</div>
      

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Edad (años):</label>
              <input
                type="number"
                name="edad"
                value={mascotaForm.edad}
                onChange={handleMascotaChange}
                min="0"
                max="30"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sexo:</label>
              <select
                name="sexo"
                value={mascotaForm.sexo}
                onChange={handleMascotaChange}
                required
                className="form-select"
              >
                <option value="">Seleccionar...</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Peso (kg):</label>
            <input
              type="number"
              name="peso"
              value={mascotaForm.peso}
              onChange={handleMascotaChange}
              min="0"
              step="0.1"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción (opcional):</label>
            <textarea
              name="descripcion"
              value={mascotaForm.descripcion}
              onChange={handleMascotaChange}
              rows={3}
              className="form-textarea"
              placeholder="Características especiales, comportamiento, etc."
            />
          </div>

          <div className="form-group">
            <label className="checkbox-group">
              <input
                type="checkbox"
                name="exotico"
                checked={mascotaForm.exotico}
                onChange={handleMascotaChange}
                className="checkbox-input"
              />
              <span>Es una mascota exótica</span>
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
              onClick={() => {
                setCurrentView('mascotas');
                setEditingMascota(null);
                setMascotaForm({
                  nombre: '',
                  edad: '',
                  sexo: '',
                  exotico: false,
                  descripcion: '',
                  peso: '',
                  idEspecie: '',
                  idRaza: ''
                });
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Guardando...' : editingMascota ? 'Actualizar Mascota' : 'Agregar Mascota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderReservas = () => (
    <div className="dashboard-main">
      <h2 className="section-title">Mis Reservas</h2>
      {reservas.length === 0 ? (
        <div className="empty-state">
          <p>No tienes reservas aún</p>
        </div>
      ) : (
        <div className="reservas-grid">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="reserva-card">
              <div className="reserva-header">
                <h3>{reserva.publicacion?.titulo}</h3>
                <span className={`status-badge status-${reserva.estado}`}>
                  {reserva.estado.toUpperCase()}
                </span>
              </div>
              
              <div className="reserva-info">
                <p><strong>Cuidador:</strong> {reserva.cuidador?.nombre}</p>
                <p><strong>Mascota:</strong> {reserva.mascota?.nombre}</p>
                <p><strong>Fechas:</strong> {reserva.fechaInicio} - {reserva.fechaFin}</p>
                <p><strong>Total:</strong> ${reserva.total}</p>
                {reserva.descripcion && (
                  <p><strong>Notas:</strong> {reserva.descripcion}</p>
                )}
              </div>

              {reserva.estado === 'pendiente' && (
                <div className="reserva-actions">
                  <button 
                    onClick={() => cancelarReserva(reserva.id)}
                    className="btn-cancel"
                  >
                    Cancelar Reserva
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPerfil = () => (
    <div className="dashboard-main">
      <div className="perfil-container">
        <div className="perfil-header">
          <h2 className="section-title">Mi Perfil</h2>
          <button 
            onClick={() => setEditingPerfil(!editingPerfil)}
            className="btn-primary"
          >
            {editingPerfil ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        {editingPerfil ? (
          <form onSubmit={handlePerfilSubmit} className="form-card">
            <div className="form-group">
              <label className="form-label">Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={perfilForm.nombre}
                onChange={handlePerfilChange}
                required
                className="form-input"
              />
            </div>
 <div className="form-group">
              <label className="form-label">Raza:</label>
              <select
                name="idRaza"
                value={mascotaForm.idRaza}
                onChange={handleMascotaChange}
                required
                className="form-select"
                disabled={!mascotaForm.idEspecie}
              >
                <option value="">Seleccionar raza...</option>
                {razasFiltradas.map((raza) => (
                  <option key={raza.id} value={raza.id}>
                    {raza.nombre}
                  </option>
                ))}
              </select>
             </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Especie:</label>
              <select
                name="idEspecie"
                value={mascotaForm.idEspecie}
                onChange={handleMascotaChange}
                required
                className="form-select"
              >
                <option value="">Seleccionar especie...</option>
                {especies.map((especie) => (
                  <option key={especie.id} value={especie.id}>
                    {especie.nombre}
                  </option>
                ))}
              </select>
            </div>
            </div>


            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                name="email"
                value={perfilForm.email}
                onChange={handlePerfilChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono:</label>
              <input
                type="tel"
                name="telefono"
                value={perfilForm.telefono}
                onChange={handlePerfilChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Tipo de documento:</label>
                <select
                  name="tipoDocumento"
                  value={perfilForm.tipoDocumento}
                  onChange={handlePerfilChange}
                  required
                  className="form-select"
                >
                  <option value="">Seleccionar...</option>
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Cedula">Cédula</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Número de documento:</label>
                <input
                  type="text"
                  name="nroDocumento"
                  value={perfilForm.nroDocumento}
                  onChange={handlePerfilChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-buttons">
              <button 
                type="button"
                onClick={() => setEditingPerfil(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        ) : (
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
              <label className="field-label">Tipo de documento:</label>
              <p className="field-value">{user?.tipoDocumento}</p>
            </div>
            <div className="perfil-field">
              <label className="field-label">Número de documento:</label>
              <p className="field-value">{user?.nroDocumento}</p>
            </div>
            <div className="perfil-field">
              <label className="field-label">Tipo de usuario:</label>
              <p className="field-value">Dueño de mascotas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading-message">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-container">
      {/* Navbar del dashboard */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <h1 className="navbar-title">PetsBnB - Dueño</h1>
          <span className="navbar-welcome">Bienvenido, {user?.nombre}</span>
        </div>
        
        <div className="navbar-buttons">
          <button
            onClick={() => setCurrentView('mascotas')}
            className={`nav-button ${currentView === 'mascotas' ? 'active' : ''}`}
          >
            Mis Mascotas
          </button>
          <button
            onClick={() => setCurrentView('reservas')}
            className={`nav-button ${currentView === 'reservas' ? 'active' : ''}`}
          >
            Mis Reservas
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
        {currentView === 'mascotas' && renderMascotas()}
        {currentView === 'reservas' && renderReservas()}
        {currentView === 'perfil' && renderPerfil()}
        {currentView === 'nueva-mascota' && renderNuevaMascota()}
      </main>
    </div>
  );
};

export default DuenoDashboard;