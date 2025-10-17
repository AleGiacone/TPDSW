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

// --------------------------------------------------
// LÓGICA DE IMÁGENES
// --------------------------------------------------

    const uploadMascotaImage = async (mascotaId, file) => {
        setImageUploading(true);
        const formData = new FormData();
        formData.append('imageFile', file);
        formData.append('idMascota', mascotaId);
        try {
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
            
            await fetchMascotas();
            
            return result;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        } finally {
            setImageUploading(false);
        }
    };

    const deleteMascotaImage = async (mascotaId) => {
        if (!window.confirm('¿Estás seguro de eliminar la imagen de esta mascota?')) {
            return;
        }

        try {
            setLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/mascotas/${mascotaId}/imagen`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al eliminar la imagen');
            }

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

    const handleImageUpload = async (mascotaId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }

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

        event.target.value = '';
    };

// --------------------------------------------------
// EFECTOS Y LÓGICA DE FILTROS (Mascotas/Especies/Razas)
// --------------------------------------------------

    useEffect(() => {
        fetchEspecies();
        fetchRazas();
    }, []); // Ya no depende de user?.idUsuario para cargar estáticos de la API

    useEffect(() => {
        if (mascotaForm.idEspecie) {
            const especieId = parseInt(mascotaForm.idEspecie);
            
            const razasDeEspecie = razas.filter(raza => {
                // Asegura la comparación como número
                return parseInt(raza.idEspecie) === especieId; 
            });

            setRazasFiltradas(razasDeEspecie);
        } else {
            setRazasFiltradas([]);
        }
    }, [mascotaForm.idEspecie, razas]);

// --------------------------------------------------
// FUNCIONES DE FETCH REALES (sin Mock Data)
// --------------------------------------------------

    const fetchMascotas = useCallback(async () => {
        console.log(' FETCHMASCOTAS INICIADO');
        
        if (!user?.idUsuario) {
            console.log(' FETCHMASCOTAS: No hay user.idUsuario, saliendo');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const url = `${API_BASE_URL}/mascotas/duenos/${user.idUsuario}`;
            
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                let mascotasArray = data.data || data.mascotas || data || [];

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
                    imagen: mascota.imagen ? {
                        idImagen: mascota.imagen.idImagen || mascota.imagen.id,
                        path: mascota.imagen.path || mascota.imagen.url,
                        url: mascota.imagen.path || mascota.imagen.url
                    } : null,
                    especie: mascota.especie ? {
                        idEspecie: mascota.especie.idEspecie || mascota.especie.id,
                        nomEspecie: mascota.especie.nomEspecie || mascota.especie.nombre,
                        nombre: mascota.especie.nomEspecie || mascota.especie.nombre
                    } : null,
                    raza: mascota.raza ? {
                        idRaza: mascota.raza.idRaza || mascota.raza.id,
                        nomRaza: mascota.raza.nomRaza || mascota.raza.nombre,
                        nombre: mascota.raza.nomRaza || mascota.raza.nombre
                    } : null,
                    idEspecie: mascota.especie?.idEspecie || mascota.especie?.id || mascota.idEspecie,
                    idRaza: mascota.raza?.idRaza || mascota.raza?.id || mascota.idRaza
                }));
                
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
            return;
        }
        
        try {
            const url = `${API_BASE_URL}/reservas/duenos/${user.idUsuario}`;
            
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                let reservasArray = data.data || data.reservas || data || [];
                setReservas(reservasArray);
            } else {
                setReservas([]); 
            }
        } catch  {
            setReservas([]); 
        }
    }, [user?.idUsuario]);

    const fetchEspecies = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/especies`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                const especiesArray = data.data || data.especies || data || [];
                
                if (especiesArray.length === 0) {
                    setError('Advertencia: No se encontraron especies en la base de datos.');
                    return;
                }
                
                const especiesFormateadas = especiesArray.map(especie => ({
                    id: especie.idEspecie || especie.id,
                    nombre: especie.nomEspecie || especie.nombre
                }));
                
                setEspecies(especiesFormateadas);
            } else {
                console.error('Error response:', response.status, response.statusText);
                setError('Error de servidor al cargar especies.');
            }
        } catch (err) {
            console.error('Error completo al cargar especies:', err);
            setError('Error de conexión al cargar especies.');
        }
    };

    const fetchRazas = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/razas`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                let razasArray = data.data || data.razas || data || [];
                
                if (razasArray.length === 0) {
                    setError(prev => prev + ' | No se encontraron razas en la base de datos.');
                    return;
                }
                
                const razasFormateadas = razasArray.map((raza) => {
                    let especieId;
                    if (raza.especie && (raza.especie.idEspecie || raza.especie.id)) {
                        especieId = raza.especie.idEspecie || raza.especie.id;
                    } else if (raza.idEspecie) {
                        especieId = raza.idEspecie;
                    } else if (raza.especie && typeof raza.especie === 'number') {
                        especieId = raza.especie;
                    }
                    
                    return {
                        id: raza.idRaza || raza.id,
                        nombre: raza.nomRaza || raza.nombre,
                        // Convertir a cadena si es un número para usar en el select
                        idEspecie: especieId ? String(especieId) : '' 
                    };
                });
                
                setRazas(razasFormateadas);
            } else {
                console.error('Error response razas:', response.status, response.statusText);
                setError(prev => prev + ' | Error de servidor al cargar razas.');
            }
        } catch (err) {
            console.error('Error completo al cargar razas:', err);
            setError(prev => prev + ' | Error de conexión al cargar razas.');
        }
    };

// --------------------------------------------------
// LÓGICA DE SUBMIT, DELETE Y EDITAR (Mascotas/Perfil)
// --------------------------------------------------

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
            
            const response = await fetch(url, {
                method: method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mascotaData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(async () => {
                    const text = await response.text();
                    return { message: text || `Error ${response.status}` };
                });
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            
            await fetchMascotas(); 

            alert(editingMascota ? 'Mascota actualizada exitosamente!' : 'Mascota creada exitosamente!');

            setMascotaForm({
                nombre: '', edad: '', sexo: '', exotico: false, descripcion: '',
                peso: '', idEspecie: '', idRaza: ''
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
        if (user?.idUsuario) {
            fetchMascotas();
            fetchReservas();
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
                headers: { 'Content-Type': 'application/json' },
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
        const id = mascotaId;
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
                headers: { 'Content-Type': 'application/json' }
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
        
        setMascotaForm({
            nombre: mascota.nomMascota || mascota.nombre || '',
            edad: mascota.edad || '',
            sexo: mascota.sexo || '',
            exotico: Boolean(mascota.exotico),
            descripcion: mascota.descripcion || '',
            peso: mascota.peso || '',
            idEspecie: String(mascota.especie?.idEspecie || mascota.especie?.id || mascota.idEspecie || mascota.especie || ''),
            idRaza: String(mascota.raza?.idRaza || mascota.raza?.id || mascota.idRaza || mascota.raza || '')
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
                headers: { 'Content-Type': 'application/json' },
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
                    onClick={() => {
                        setEditingMascota(null); 
                        setCurrentView('nueva-mascota');
                    }}
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
                                    nombre: '', edad: '', sexo: '', exotico: false, descripcion: '',
                                    peso: '', idEspecie: '', idRaza: ''
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
                    <h1 id= "main-title" className="navbar-title">PetsBnB Dueño</h1>
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