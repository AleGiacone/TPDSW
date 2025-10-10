import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
  const [imageUploading, setImageUploading] = useState(false);
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

  const [perfilForm, setPerfilForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    nroDocumento: user?.nroDocumento || '',
    tipoDocumento: user?.tipoDocumento || ''
  });
  const [editingPerfil, setEditingPerfil] = useState(false);

// Función para subir imagen de mascota
const uploadMascotaImage = async (mascotaId, file) => {
setImageUploading(true);
 const formData = new FormData();
 formData.append('imageFile', file);
 formData.append('idMascota', mascotaId);
 try {
  // CORRECCIÓN: Se agregó el idMascota a la URL.
  const response = await fetch(`${API_BASE_URL}/mascotas/${mascotaId}/upload`, {
   method: 'POST',
   credentials: 'include',
   body: formData
  });
  if (!response.ok) {
   const errorData = await response.json().catch(() => ({}));
   throw new Error(errorData.message || 'Error al subir imagen');
  }
  const result = await response.json();
  console.log('Imagen subida exitosamente:', result);
  
  // Actualizar la lista de mascotas para mostrar la nueva imagen
  await fetchMascotas();
  
  return result;
 } catch (error) {
  console.error('Error uploading image:', error);
  throw error;
 } finally {
  setImageUploading(false);
 }
};


// Función para eliminar imagen de mascota
// Función para eliminar imagen de mascota
const deleteMascotaImage = async (mascotaId) => {
  if (!window.confirm('¿Estás seguro de eliminar la imagen de esta mascota?')) {
    return;
  }

  try {
    setLoading(true);
    
    // CORRECCIÓN: Usar el método DELETE y pasar el ID de la mascota en la URL.
    // Esto es mucho más eficiente y es la forma correcta de hacerlo.
    const response = await fetch(`${API_BASE_URL}/mascotas/${mascotaId}/imagen`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Si el servidor envía un error, lánzalo
      throw new Error(errorText || 'Error al eliminar la imagen');
    }

    // Opcional: Actualizar el estado local de la mascota para que la imagen desaparezca
    setMascotas(prevMascotas =>
      prevMascotas.map(mascota =>
        mascota.idMascota === mascotaId ? { ...mascota, imagen: null, fotoPerfil: null } : mascota
      )
    );

    alert('Imagen eliminada exitosamente');

  } catch (error) {
    console.error('Error deleting image:', error);
    alert('Error al eliminar imagen: ' + error.message);
  } finally {
    setLoading(false);
  }
};

// Manejar selección de archivo
const handleImageUpload = async (mascotaId, event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido');
    return;
  }

  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('El archivo es muy grande. Máximo 5MB permitido');
    return;
  }

  try {
    await uploadMascotaImage(mascotaId, file);
    alert('Imagen subida exitosamente');
  } catch (error) {
    alert('Error al subir imagen: ' + error.message);
  }

  // Limpiar el input
  event.target.value = '';
};

useEffect(() => {
  console.log('Estado especies actualizado:', especies);
}, [especies]);

useEffect(() => {
  console.log('Estado razas actualizado:', razas);
}, [razas]);

useEffect(() => {
  fetchEspecies();
  fetchRazas();
}, [user?.idUsuario]);

useEffect(() => {
  if (mascotaForm.idEspecie) {
    const especieId = parseInt(mascotaForm.idEspecie);
    
    const razasDeEspecie = razas.filter(raza => {
      return raza.idEspecie === especieId;
    });

    console.log('Razas filtradas para especie', especieId, ':', razasDeEspecie);
    setRazasFiltradas(razasDeEspecie);
  } else {
    setRazasFiltradas([]);
  }
}, [mascotaForm.idEspecie, razas]);

useEffect(() => {
  console.log(' USER STATE CHANGED:');
  console.log('user:', user);
  console.log('user?.id:', user?.idUsuario);
  console.log('user properties:');
  if (user) {
    Object.keys(user).forEach(key => {
      console.log(`  ${key}:`, user[key], `(${typeof user[key]})`);
    });
  } else {
    console.log('  user is null/undefined');
  }
}, [user?.idUsuario]);

const MOCK_ESPECIES = [
  { id: 1, nombre: 'Perro' },
  { id: 2, nombre: 'Gato' },
  { id: 3, nombre: 'Ave' },
  { id: 4, nombre: 'Reptil' },
  { id: 5, nombre: 'Pez' }
];

const MOCK_RAZAS = [
  // Razas de perros
  { id: 1, nombre: 'Labrador', idEspecie: 1 },
  { id: 2, nombre: 'Golden Retriever', idEspecie: 1 },
  { id: 3, nombre: 'Pastor Alemán', idEspecie: 1 },
  { id: 4, nombre: 'Bulldog', idEspecie: 1 },
  { id: 5, nombre: 'Mestizo', idEspecie: 1 },
  
  // Razas de gatos
  { id: 6, nombre: 'Persa', idEspecie: 2 },
  { id: 7, nombre: 'Siamés', idEspecie: 2 },
  { id: 8, nombre: 'Maine Coon', idEspecie: 2 },
  { id: 9, nombre: 'Mestizo', idEspecie: 2 },
  
  // Aves
  { id: 10, nombre: 'Canario', idEspecie: 3 },
  { id: 11, nombre: 'Periquito', idEspecie: 3 },
  { id: 12, nombre: 'Loro', idEspecie: 3 },
  
  // Reptiles
  { id: 13, nombre: 'Iguana', idEspecie: 4 },
  { id: 14, nombre: 'Gecko', idEspecie: 4 },
  { id: 15, nombre: 'Tortuga', idEspecie: 4 },
  
  // Peces
  { id: 16, nombre: 'Goldfish', idEspecie: 5 },
  { id: 17, nombre: 'Betta', idEspecie: 5 }
];

const fetchMascotas = useCallback(async () => {
  console.log(' FETCHMASCOTAS INICIADO');
  console.log('🔍 user:', user);
  console.log('🔍 user?.idUsuario:', user?.idUsuario);
  
  if (!user?.idUsuario) {
    console.log(' FETCHMASCOTAS: No hay user.idUsuario, saliendo');
    return;
  }
  
  setLoading(true);
  setError('');
  
  try {
    const url = `${API_BASE_URL}/mascotas/duenos/${user.idUsuario}`;
    console.log(' FETCH URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(' FETCH Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(' FETCH Data completa:', data);
      let mascotasArray = [];
      
      if (data.data && Array.isArray(data.data)) {
        mascotasArray = data.data;
      } else if (data.mascotas && Array.isArray(data.mascotas)) {
        mascotasArray = data.mascotas;
      } else if (Array.isArray(data)) {
        mascotasArray = data;
      } else {
        console.error(' Estructura de datos inesperada:', data);
        mascotasArray = [];
      }

      const mascotasNormalizadas = mascotasArray.map(mascota => ({
        id: mascota.idMascota || mascota.id,
        idMascota: mascota.idMascota || mascota.id,
        nomMascota: mascota.nomMascota || mascota.nombre,
        nombre: mascota.nomMascota || mascota.nombre,
        edad: mascota.edad,
        sexo: mascota.sexo,
        exotico: mascota.exotico,
        descripcion: mascota.descripcion,
        peso: mascota.peso,
        fotoPerfil: mascota.fotoPerfil,
        // Normalizar imagen
        imagen: mascota.imagen ? {
          idImagen: mascota.imagen.idImagen || mascota.imagen.id,
          path: mascota.imagen.path || mascota.imagen.url,
          url: mascota.imagen.path || mascota.imagen.url
        } : null,
        // Normalizar especie
        especie: mascota.especie ? {
          idEspecie: mascota.especie.idEspecie || mascota.especie.id,
          nomEspecie: mascota.especie.nomEspecie || mascota.especie.nombre,
          nombre: mascota.especie.nomEspecie || mascota.especie.nombre
        } : null,
        // Normalizar raza
        raza: mascota.raza ? {
          idRaza: mascota.raza.idRaza || mascota.raza.id,
          nomRaza: mascota.raza.nomRaza || mascota.raza.nombre,
          nombre: mascota.raza.nomRaza || mascota.raza.nombre
        } : null,
        // IDs para formularios
        idEspecie: mascota.especie?.idEspecie || mascota.especie?.id || mascota.idEspecie,
        idRaza: mascota.raza?.idRaza || mascota.raza?.id || mascota.idRaza
      }));
      
      console.log(' MASCOTAS NORMALIZADAS:', mascotasNormalizadas);
      setMascotas(mascotasNormalizadas);
      
    } else {
      console.error('FETCH Error status:', response.status);
      const errorText = await response.text();
      console.error(' FETCH Error response:', errorText);
      setError(`Error del servidor: ${response.status}`);
      setMascotas([]);
    }
  } catch (err) {
    console.error('FETCH Error completo:', err);
    setError('Error de conexión al cargar mascotas');
    setMascotas([]);
  } finally {
    setLoading(false);
  }
}, [user?.idUsuario]);


const fetchReservas = useCallback(async () => {
  if (!user?.idUsuario) {
    console.log('FETCHRESERVAS: No hay user.id, saliendo');
    return;
  }
  
  try {
    const url = `${API_BASE_URL}/reservas/duenos/${user.idUsuario}`;
    console.log(' RESERVAS FETCH URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('RESERVAS Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(' RESERVAS Data completa:', data);
      console.log(' RESERVAS Tipo de data:', typeof data);
      console.log(' RESERVAS Keys de data:', Object.keys(data));
      let reservasArray = [];
      
      if (data.data && Array.isArray(data.data)) {
        reservasArray = data.data;
        console.log('Reservas encontradas en data.data:', reservasArray.length);
      } else if (data.reservas && Array.isArray(data.reservas)) {
        reservasArray = data.reservas;
        console.log('Reservas encontradas en data.reservas:', reservasArray.length);
      } else if (Array.isArray(data)) {
        reservasArray = data;
        console.log('data es directamente el array:', reservasArray.length);
      } else {
        console.error(' No se pudo extraer array de reservas. Estructura recibida:', data);
        reservasArray = [];
      }
      
      console.log('RESERVAS Array final:', reservasArray);
      setReservas(reservasArray);
    } else {
      console.error('RESERVAS Error status:', response.status);
      setReservas([]); // Set empty array on error
    }
  } catch (err) {
    console.error(' RESERVAS Error completo:', err);
    setReservas([]); // Set empty array on error
  }
}, [user?.idUsuario]);

const fetchEspecies = async () => {
  try {
    console.log('Fetching especies...');
    const response = await fetch(`${API_BASE_URL}/especies`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Datos especies completos:', data);
      
      const especiesArray = data.data || data.especies || data || [];
      
      console.log('Especies array length:', especiesArray.length);
      
      if (especiesArray.length === 0) {
        console.warn('Backend devuelve especies vacías, usando datos mock');
        setError(' Usando datos de prueba (backend sin datos)');
        setEspecies(MOCK_ESPECIES);
        return;
      }
      
      const especiesFormateadas = especiesArray.map(especie => ({
        id: especie.idEspecie || especie.id,
        nombre: especie.nomEspecie || especie.nombre
      }));
      
      console.log('Especies formateadas:', especiesFormateadas);
      setEspecies(especiesFormateadas);
    } else {
      console.error('Error response:', response.status, response.statusText);
      // Si hay error en el servidor, usar datos mock
      console.warn('Error en servidor, usando datos mock');
      setError(' Error de servidor, usando datos de prueba');
      setEspecies(MOCK_ESPECIES);
    }
  } catch (err) {
    console.error('Error completo al cargar especies:', err);
    // Si hay error de conexión, usar datos mock
    console.warn('Error de conexión, usando datos mock');
    setError(' Error de conexión, usando datos de prueba');
    setEspecies(MOCK_ESPECIES);
  }
};

const fetchRazas = async () => {
  try {
    console.log('Fetching razas...');
    const response = await fetch(`${API_BASE_URL}/razas`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Razas response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('===== DATOS RAZAS COMPLETOS =====');
      console.log('Raw data:', data);
      
      let razasArray = data.data || data.razas || data || [];
      
      console.log('Razas array length:', razasArray.length);
      console.log('Primer elemento de razas (si existe):', razasArray[0]);
      
      if (razasArray.length === 0) {
        console.warn(' Backend devuelve razas vacías, usando datos mock');
        setRazas(MOCK_RAZAS);
        return;
      }
      

      const razasFormateadas = razasArray.map((raza, index) => {
        console.log(`Raza ${index}:`, raza);
        console.log(`  - ID: ${raza.idRaza || raza.id}`);
        console.log(`  - Nombre: ${raza.nomRaza || raza.nombre}`);
        console.log(`  - Especie completa:`, raza.especie);

        let especieId;
        if (raza.especie && raza.especie.idEspecie) {
          especieId = raza.especie.idEspecie;
          console.log(`  - Especie ID (de raza.especie.idEspecie): ${especieId}`);
        } else if (raza.idEspecie) {
          especieId = raza.idEspecie;
          console.log(`  - Especie ID (de raza.idEspecie): ${especieId}`);
        } else if (raza.especie && typeof raza.especie === 'number') {
          especieId = raza.especie;
          console.log(`  - Especie ID (de raza.especie como número): ${especieId}`);
        }
        
        return {
          id: raza.idRaza || raza.id,
          nombre: raza.nomRaza || raza.nombre,
          idEspecie: especieId
        };
      });
      
      console.log('===== RAZAS FORMATEADAS =====');
      razasFormateadas.forEach((raza, i) => {
        console.log(`Raza ${i}:`, raza);
      });
      
      setRazas(razasFormateadas);
    } else {
      console.error('Error response razas:', response.status, response.statusText);
      console.warn('Error en servidor razas, usando datos mock');
      setRazas(MOCK_RAZAS);
    }
  } catch (err) {
    console.error('Error completo al cargar razas:', err);
    console.warn('Error de conexión razas, usando datos mock');
    setRazas(MOCK_RAZAS);
  }
};

  const handleMascotaSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  const edadNumerica = parseInt(mascotaForm.edad, 10);
  const pesoNumerico = parseFloat(mascotaForm.peso);

  if (isNaN(edadNumerica) || edadNumerica <= 0) {
    setError('Por favor, ingresa una edad válida (número entero positivo).');
    setLoading(false);
    return;
  }
  
  if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
    setError('Por favor, ingresa un peso válido (número positivo).');
    setLoading(false);
    return;
  }

  try {
    const url = editingMascota 
      ? `${API_BASE_URL}/mascotas/${editingMascota.idMascota || editingMascota.id}`
      : `${API_BASE_URL}/mascotas`;
    
    const method = editingMascota ? 'PUT' : 'POST';
    
    const mascotaData = {
      nomMascota: mascotaForm.nombre.trim(),
      edad: mascotaForm.edad.toString(),
      sexo: mascotaForm.sexo,
      exotico: Boolean(mascotaForm.exotico),
      descripcion: mascotaForm.descripcion.trim(),
      peso: pesoNumerico,
      especie: parseInt(mascotaForm.idEspecie),
      raza: parseInt(mascotaForm.idRaza),
      dueno: parseInt(user.idUsuario)
    };
    if (editingMascota) {
        mascotaData.idMascota = editingMascota.idMascota;
    }

    console.log(`📤 DATOS A ENVIAR (${method}):`, mascotaData);
    console.log('📤 URL:', url);
    
    const response = await fetch(url, {
      method: method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mascotaData)
    });

    console.log(` FETCH COMPLETADO - Status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(async () => {
        const text = await response.text();
        return { message: text || `Error ${response.status}` };
      });
      console.error(' ERROR RESPONSE:', errorData);
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    const responseData = await response.json();
    console.log(' RESPONSE DATA:', responseData);
    
    if (editingMascota) {
      await fetchMascotas();
      alert('Mascota actualizada exitosamente!');
    } else {
      await fetchMascotas();
      alert('Mascota creada exitosamente!');
    }
    
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
    console.error('ERROR:', err);
    setError('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    console.log('DASHBOARD PRINCIPAL');
    console.log('user:', user);
    console.log('user?.idUsuario:', user?.idUsuario);
    
    if (user?.idUsuario) {
      console.log('Usuario autenticado con ID:', user.idUsuario);
      fetchMascotas();
      fetchReservas();
    } else {
      console.log('No hay usuario autenticado o sin idUsuario');
      if (user) {
        console.log('Usuario existe pero sin idUsuario. Propiedades:', Object.keys(user));
      }
    }
  }, [user?.idUsuario, fetchMascotas, fetchReservas]);

    const handlePerfilSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${user.idUsuario}`, {
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

  const deleteMascota = async (mascotaId) => {
    const id = mascotaId 
    if (!id) {
      alert('Error: No se pudo identificar la mascota');
      return;
    }
    
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

      setMascotas(prev => prev.filter(m => 
        (m.id !== id) && (m.idMascota !== id)
      ));
      
      alert('Mascota eliminada exitosamente');
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar mascota: ' + err.message);
    }
  };

    const startEditMascota = (mascota) => {
    console.log('🔧 EDITANDO MASCOTA:', mascota);
    
    setMascotaForm({
      nombre: mascota.nomMascota || mascota.nombre || '',
      edad: mascota.edad || '',
      sexo: mascota.sexo || '',
      exotico: Boolean(mascota.exotico),
      descripcion: mascota.descripcion || '',
      peso: mascota.peso || '',
      idEspecie: mascota.especie?.idEspecie || mascota.especie?.id || 
                mascota.idEspecie || mascota.especie || '',
      idRaza: mascota.raza?.idRaza || mascota.raza?.id || 
              mascota.idRaza || mascota.raza || ''
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

        {!Array.isArray(mascotas) ? (
          <div className="error-message">
            Error: Datos de mascotas inválidos. Por favor, recarga la página.
          </div>
        ) : mascotas.length === 0 && !loading ? (
          <div className="empty-state">
            <p>Aún no tienes mascotas registradas</p>
          </div>
        ) : (
          <div className="mascotas-grid">
            {mascotas.map((mascota) => (
              <div key={mascota.id || mascota.idMascota} className="mascota-card">
                {/* Sección de imagen */}
                <div className="mascota-image-section-horizontal">
                  {mascota.imagen?.path || mascota.fotoPerfil ? (
                    <div className="mascota-image-container">
                      <img 
                        src={mascota.imagen?.path || mascota.fotoPerfil}
                        alt={`Foto de ${mascota.nomMascota || mascota.nombre}`} width="300" height="350"
                        className="mascota-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="image-overlay">
                        <button 
                          onClick={() => deleteMascotaImage(mascota.id || mascota.idMascota)}
                          className="btn-delete-image"
                          title="Eliminar imagen"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mascota-no-image">
                      {mascota.exotico ? '🦎' : '🐕'}
                    </div>
                  )}
                  
                  <div className="image-upload-section">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(mascota.id || mascota.idMascota, e)}
                      className="file-input-hidden"
                      id={`file-input-${mascota.id || mascota.idMascota}`}
                      disabled={imageUploading}
                    />
                    <label 
                      htmlFor={`file-input-${mascota.id || mascota.idMascota}`}
                      className="btn-upload-image"
                    >
                      {imageUploading ? '📤 Subiendo...' : '📷 Cambiar Foto'}
                    </label>
                  </div>
                </div>
                
                 <div className="mascota-details-section">
                <div className="mascota-header">
                  <h3 className="mascota-name">
                    {mascota.nomMascota || mascota.nombre || 'Sin nombre'}
                  </h3>
                </div>
                
                <div className="mascota-details">
                  <p><strong>Especie:</strong> {mascota.especie?.nomEspecie || mascota.especie?.nombre || 'N/A'}</p>
                  <p><strong>Raza:</strong> {mascota.raza?.nomRaza || mascota.raza?.nombre || 'N/A'}</p>
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
                    onClick={() => deleteMascota(mascota.id || mascota.idMascota)}
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
                    <option 
                      key={especie.id} 
                      value={especie.id}
                    >
                      {especie.nombre}
                    </option>
                  ))}
                </select>
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
                  <option value="">
                    {!mascotaForm.idEspecie 
                      ? "Primero selecciona una especie..." 
                      : razasFiltradas.length === 0 
                        ? "No hay razas disponibles para esta especie"
                        : "Seleccionar raza..."
                    }
                  </option>
                  {razasFiltradas.map((raza) => (
                    <option 
                      key={raza.id} 
                      value={raza.id}
                    >
                      {raza.nombre}
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
        {!Array.isArray(reservas) ? (
          <div className="error-message">
            Error: Datos de reservas inválidos. Por favor, recarga la página.
          </div>
        ) : reservas.length === 0 ? (
          <div className="empty-state">
            <p>No tienes reservas aún</p>
          </div>
        ) : (
          <div className="reservas-grid">
            {reservas.map((reserva) => (
              <div key={reserva.id || reserva.idReserva} className="reserva-card">
                <div className="reserva-header">
                  <h3>{reserva.publicacion?.titulo || 'Sin título'}</h3>
                  <span className={`status-badge status-${reserva.estado}`}>
                    {reserva.estado.toUpperCase()}
                  </span>
                </div>
                
                <div className="reserva-info">
                  <p><strong>Cuidador:</strong> {reserva.cuidador?.nombre || 'N/A'}</p>
                  <p><strong>Mascota:</strong> {reserva.mascota?.nomMascota || reserva.mascota?.nombre || 'N/A'}</p>
                  <p><strong>Fechas:</strong> {reserva.fechaInicio} - {reserva.fechaFin}</p>
                  <p><strong>Total:</strong> ${reserva.total}</p>
                  {reserva.descripcion && (
                    <p><strong>Notas:</strong> {reserva.descripcion}</p>
                  )}
                </div>

                {reserva.estado === 'pendiente' && (
                  <div className="reserva-actions">
                    <button 
                      onClick={() => cancelarReserva(reserva.id || reserva.idReserva)}
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
      <div id="main-dashboard" className="dashboard-container">
        {/* Navbar del dashboard */}
        <nav id= "main-navbar" className="dashboard-navbar">
          <div className="navbar-brand">
            <h1 id= "main-title" className="navbar-title">PetsBnB  Dueño</h1>
            <span className="navbar-welcome">Bienvenido, {user?.nombre}</span>
          </div>
          <div className="navbar-buttons">
            <button
              onClick={() => setCurrentView('mascotas')}
              className={`nav-button ${currentView === 'mascotas' ? 'active' : ''}`}
            >
              Mascotas
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
          {currentView === 'mascotas' && renderMascotas()}
          {currentView === 'reservas' && renderReservas()}
          {currentView === 'perfil' && renderPerfil()}
          {currentView === 'nueva-mascota' && renderNuevaMascota()}
        </main>
      </div>
    );
  };

  export default DuenoDashboard;