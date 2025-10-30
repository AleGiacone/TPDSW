import React, { useState, useEffect, useCallback } from 'react'; 
import { useAuth } from '../../hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom'; 
import ImageCarousel from '../../components/ImageCarousel'; 
import '../../styles/DashboardCuidador.css';
import { Home, CalendarCheck, User, LogOut } from 'lucide-react';



const CuidadorDashboard = () => {
    const navigate = useNavigate(); 
    const [currentView, setCurrentView] = useState('publicaciones');
    const [publicaciones, setPublicaciones] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [existingImages, setExistingImages] = useState([]); 
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [editingPublicacion, setEditingPublicacion] = useState(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const { user, logout, updateUser} = useAuth(); 
    const [profileFormData, setProfileFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        tipoDocumento: 'DNI',
        nroDocumento: '',
        sexoCuidador: '',
        descripcion: '',
    });
    const [profileImage, setProfileImage] = useState(null);


const startEditProfile = () => {
    if (user) {
        setProfileFormData({
            nombre: user.nombre || '',
            email: user.email || '',
            telefono: user.telefono || '',
            tipoDocumento: user.tipoDocumento || 'DNI',
            nroDocumento: user.nroDocumento || '',
            sexoCuidador: user.sexoCuidador || '',
            descripcion: user.descripcion || '',
        });
        setProfileImage(null);
        setError('');
        setEditingProfile(true);
    }
};

const cancelEditProfile = () => {
    setEditingProfile(false);
    setProfileImage(null);
    setError('');
};

const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
        ...prev,
        [name]: value
    }));
};

const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setProfileImage(e.target.files[0]);
    }
};

const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        let updatedImagePath = user?.perfilImage;
        
        if (profileImage) {
            console.log('📸 Subiendo nueva imagen de perfil...');
            const imageFormData = new FormData();
            imageFormData.append('profileImage', profileImage);
            
            const imageResponse = await fetch(
                `${API_BASE_URL}/cuidador/${user.idUsuario}/profile-image`, 
                {
                    method: 'POST',
                    body: imageFormData,
                    credentials: 'include'
                }
            );
            
            if (!imageResponse.ok) {
                const imgError = await imageResponse.json();
                throw new Error(imgError.message || 'Error al actualizar la imagen');
            }
            
            const imageData = await imageResponse.json();
            updatedImagePath = imageData.data.perfilImage;
        }

        const response = await fetch(
            `${API_BASE_URL}/cuidador/${user.idUsuario}/profile`, 
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: profileFormData.nombre,
                    email: profileFormData.email,
                    telefono: profileFormData.telefono,
                    descripcion: profileFormData.descripcion,
                    sexoCuidador: profileFormData.sexoCuidador
                }),
                credentials: 'include'
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar perfil');
        }

        const data = await response.json();
        console.log(' Respuesta del servidor:', data);
        
        const updatedUserData = {
            ...user,
            nombre: profileFormData.nombre,
            email: profileFormData.email,
            telefono: profileFormData.telefono,
            descripcion: profileFormData.descripcion,
            sexoCuidador: profileFormData.sexoCuidador,
            perfilImage: updatedImagePath
        };
        
        
        updateUser(updatedUserData);
        
        setEditingProfile(false);
        setProfileImage(null);
        setError('')

    } catch (error) {
        console.error(' Error al actualizar perfil:', error);
        setError(error.message || 'Error al actualizar el perfil');
        alert(' ' + error.message);
    } finally {
        setLoading(false);
    }
};
    const [files, setFiles] = useState([]); 
    
    const API_BASE_URL = 'http://localhost:3000/api';

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        tarifaPorDia: '',
        ubicacion: '',
        tipoAlojamiento: '',
        cantAnimales: '',
        exotico: false
    });
    
  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    
    console.log("🔍 DIAGNÓSTICO DETALLADO DE ARCHIVOS:");
    console.log("  Archivos seleccionados:", selectedFiles.length);
    const arrayFiles = Array.from(selectedFiles);
    console.log("  Array creado con length:", arrayFiles.length);
    
  
    arrayFiles.forEach((file, i) => {
        console.log(`  ${i + 1}. Nombre: ${file.name}`);
        console.log(`      Tamaño: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`      Tipo: ${file.type}`);
        console.log(`      lastModified: ${file.lastModified}`);
        console.log(`      Instancia única: ${file.name}-${file.size}-${file.lastModified}`);
    });
    
    const uniqueFiles = new Map();
    arrayFiles.forEach((file, i) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (uniqueFiles.has(key)) {
            console.warn(`⚠️ ADVERTENCIA: Archivo duplicado detectado en índice ${i}: ${file.name}`);
        } else {
            uniqueFiles.set(key, file);
        }
    });
    
    console.log(`  Archivos únicos: ${uniqueFiles.size} de ${arrayFiles.length}`);
    

    const limitedFiles = arrayFiles.slice(0, 5);
    
    if (arrayFiles.length > 5) {
        alert(`Solo puedes subir un máximo de 5 imágenes. Se han seleccionado las primeras 5.`);
    }
    
    console.log("  Archivos finales a guardar:", limitedFiles.length);
    setFiles(limitedFiles);
};

const removeFile = (indexToRemove) => {
    console.log(`   Archivo a remover: ${files[indexToRemove]?.name}`);
    
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    
    console.log(`   Archivos restantes: ${newFiles.length}`);
    setFiles(newFiles);
};
   
    const fetchPublicaciones = useCallback(async () => {
        if (!user?.idUsuario) return;
        setLoading(true);
        setError('');
        
        try {
            const userId = user.idUsuario;
            const response = await fetch(`${API_BASE_URL}/publicacion/cuidador/${userId}`, {
                method: 'GET',
                credentials: 'include', 
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setPublicaciones(Array.isArray(data.publicaciones) ? data.publicaciones : []);
        } catch (err) {
            setError('Error al cargar publicaciones: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.idUsuario]); 

    const fetchReservas = useCallback(async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`${API_BASE_URL}/reserva/cuidador/${user.id}`, {
                method: 'GET', 
                credentials: 'include', 
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                setReservas(data.reservas || data || []);
            }
        } catch (err) {
            console.error('Error al cargar reservas:', err);
        }
    }, [user?.id]); 



    useEffect(() => {
        if (user?.idUsuario) {
            fetchPublicaciones();
        }
    }, [user?.idUsuario, fetchPublicaciones]); 


    useEffect(() => {
        if (user?.id) {
            fetchReservas();
        }
    }, [user?.id, fetchReservas]); 


    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userId = user.id || user.idUsuario || user.userId;
    
    if (!userId) {
        setError('Error: No se pudo obtener el ID del usuario');
        setLoading(false);
        return;
    }

    console.log("\n=== 🔍 VERIFICACIÓN PRE-ENVÍO ===");
    console.log("📁 Total de archivos en state:", files.length);
    

    const fileSignatures = files.map(f => `${f.name}-${f.size}-${f.lastModified}`);
    const uniqueSignatures = new Set(fileSignatures);
    
    if (fileSignatures.length !== uniqueSignatures.size) {
        fileSignatures.forEach((sig, i) => {
            const count = fileSignatures.filter(s => s === sig).length;
            if (count > 1) {
                console.error(`  Duplicado: ${files[i].name} (aparece ${count} veces)`);
            }
        });
    } else {
        console.log("✅ Todos los archivos en state son únicos");
    }
    
    files.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB) [${file.lastModified}]`);
    });

    const formDataPayload = new FormData();
    formDataPayload.append('idUsuario', userId);
    formDataPayload.append('titulo', formData.titulo);
    formDataPayload.append('descripcion', formData.descripcion);
    formDataPayload.append('tarifaPorDia', formData.tarifaPorDia);
    formDataPayload.append('ubicacion', formData.ubicacion);
    formDataPayload.append('tipoAlojamiento', formData.tipoAlojamiento);
    formDataPayload.append('cantAnimales', formData.cantAnimales);
    formDataPayload.append('exotico', formData.exotico);

    console.log("\n📎 Agregando archivos al FormData:");
    files.forEach((file, index) => {
        console.log(`  Agregando ${index + 1}/${files.length}: ${file.name} (${file.size} bytes)`);
        formDataPayload.append('images', file, file.name);
    });

    let imageCount = 0;
    const imagesInFormData = [];
    for (let [key, value] of formDataPayload.entries()) {
        if (key === 'images') {
            imageCount++;
            imagesInFormData.push({
                index: imageCount,
                name: value.name,
                size: value.size,
                type: value.type
            });
            console.log(`  images[${imageCount}]:`, {
                name: value.name,
                size: value.size,
                type: value.type
            });
        }
    }

    const formDataNames = imagesInFormData.map(img => img.name);
    const uniqueFormDataNames = new Set(formDataNames);
    if (formDataNames.length !== uniqueFormDataNames.size) {
        setError('Hay archivos duplicados en las imágenes seleccionadas');
        setLoading(false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/publicacion`, {
            method: 'POST',
            credentials: 'include',
            body: formDataPayload
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        await fetchPublicaciones();
        setFiles([]);
        setFormData({
            titulo: '',
            descripcion: '',
            tarifaPorDia: '',
            ubicacion: '',
            tipoAlojamiento: '',
            cantAnimales: '',
            exotico: false
        });
        setCurrentView('publicaciones');
        alert('Publicación creada exitosamente');
    } catch (err) {
        console.error('Error al crear publicación:', err);
        setError('Error al crear publicación: ' + err.message);
        alert('Error al crear publicación: ' + err.message);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    files.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file.name}`);
    });
}, [files]);

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
        if (!window.confirm('¿Estás seguro de eliminar esta publicación? Esta acción es irreversible y eliminará todas las imágenes asociadas.')) { 
            return; 
        }
        
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/publicacion/${id}`, { 
                method: 'DELETE', 
                credentials: 'include', 
                headers: { 'Content-Type': 'application/json' } 
            });

            if (!response.ok) { 
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: No se pudo eliminar la publicación.`); 
            }
            setPublicaciones(prev => prev.filter(pub => pub.id !== id));
            

        } catch (err) { 
            console.error('Error al eliminar:', err);
            setError('Error al eliminar publicación: ' + err.message);
            alert(' Error al eliminar publicación: ' + err.message); 
        } finally {
            setLoading(false);
        }
    };
    const startEditPublicacion = (pub) => {
        console.log('Editando publicación:', pub);
        
        setEditingPublicacion(pub);
        setFormData({
            titulo: pub.titulo,
            descripcion: pub.descripcion,
            tarifaPorDia: pub.tarifaPorDia,
            ubicacion: pub.ubicacion,
            tipoAlojamiento: pub.tipoAlojamiento,
            cantAnimales: pub.cantAnimales,
            exotico: pub.exotico
        });
        setExistingImages(pub.imagenes || []);
        setFiles([]);
        setImagesToDelete([]);
        setCurrentView('editar-publicacion');
    };

    const markImageForDeletion = (imageId) => {
        setImagesToDelete(prev => [...prev, imageId]);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    };


    const cancelEdit = () => {
        setEditingPublicacion(null);
        setFormData({
            titulo: '',
            descripcion: '',
            tarifaPorDia: '',
            ubicacion: '',
            tipoAlojamiento: '',
            cantAnimales: '',
            exotico: false
        });
        setExistingImages([]);
        setFiles([]);
        setImagesToDelete([]);
        setCurrentView('publicaciones');
    };


    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataPayload = new FormData();
            
            formDataPayload.append('titulo', formData.titulo);
            formDataPayload.append('descripcion', formData.descripcion);
            formDataPayload.append('tarifaPorDia', formData.tarifaPorDia);
            formDataPayload.append('ubicacion', formData.ubicacion);
            formDataPayload.append('tipoAlojamiento', formData.tipoAlojamiento);
            formDataPayload.append('cantAnimales', formData.cantAnimales);
            formDataPayload.append('exotico', formData.exotico);
        
            if (imagesToDelete.length > 0) {
                formDataPayload.append('imagesToDelete', JSON.stringify(imagesToDelete));
            }
            
            files.forEach((file) => {
                formDataPayload.append('images', file);
            });

            const response = await fetch(`${API_BASE_URL}/publicacion/${editingPublicacion.id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formDataPayload
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            await fetchPublicaciones();
            cancelEdit();
            alert('Publicación actualizada exitosamente!');

        } catch (err) {
            console.error('Error al actualizar:', err);
            setError('Error al actualizar publicación: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    const updateReservaEstado = async (reservaId, nuevoEstado) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reserva/${reservaId}/estado`, { 
                method: 'PUT', 
                credentials: 'include', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!response.ok) { 
                throw new Error(`Error ${response.status}`); 
            }
            setReservas(prev => prev.map(reserva => 
                reserva.id === reservaId ? { ...reserva, estado: nuevoEstado } : reserva
            ));
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
                            <div className="card-image-wrapper">
                                <ImageCarousel 
                                    imagenes={pub.imagenes || []} 
                                    titulo={pub.titulo}
                                />
                            </div>
                            
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
                                <button onClick={() => startEditPublicacion(pub)} className="btn-edit">
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

    const renderNuevaPublicacion = () => (
        <div className="dashboard-main">
            <div className="form-container">
                <h2 className="section-title">Nueva Publicación</h2>
                
                <form onSubmit={handleSubmit} className="form-card" encType="multipart/form-data">
                    <div className="form-group">
                        <label className="form-label">Título:</label>
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
                        <label className="form-label">Descripción:</label>
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
                            <label className="form-label">Tarifa por día ($):</label>
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
                            <label className="form-label">Cantidad de animales:</label>
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
                        <label className="form-label">Ubicación:</label>
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
                        <label className="form-label">Tipo de alojamiento:</label>
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

                    <div className="form-group file-upload-group">
                        <label className="form-label">
                            Fotos de la Publicación (Máx. 5):
                        </label>
                        
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                name="images" 
                                onChange={handleFileChange}
                                multiple 
                                accept="image/*" 
                                className="form-input file-input"
                                id="file-input"
                            />
                            <label htmlFor="file-input" className="file-input-label">
                                📁 Seleccionar imágenes (mantenga Ctrl/Cmd para seleccionar varias)
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="image-preview-container">
                                <p className="file-count">
                                    {files.length} imagen{files.length !== 1 ? 'es' : ''} seleccionada{files.length !== 1 ? 's' : ''} ({5 - files.length} restante{5 - files.length !== 1 ? 's' : ''})
                                </p>
                                <div className="image-preview-grid">
                                    {files.map((file, index) => (
                                        <div key={index} className="image-preview-item">
                                            <img 
                                                src={URL.createObjectURL(file)} 
                                                alt={`Preview ${index + 1}`}
                                                className="preview-thumbnail"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="remove-image-btn"
                                                title="Eliminar imagen"
                                            >
                                                ✕
                                            </button>
                                            <span className="image-name">{file.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (<div className="error-message">{error}</div>)}

                    <div className="form-buttons">
                        <button 
                            type="button" 
                            onClick={() => {
                                setCurrentView('publicaciones');
                                setFiles([]); 
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
                            {loading ? 'Creando...' : 'Crear Publicación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
    const renderEditarPublicacion = () => (
        <div className="dashboard-main">
            <div className="form-container">
                <h2 className="section-title">Editar Publicación</h2>
                
                <form onSubmit={handleUpdate} className="form-card" encType="multipart/form-data">
                    <div className="form-group">
                        <label className="form-label">Título:</label>
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
                        <label className="form-label">Descripción:</label>
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
                            <label className="form-label">Tarifa por día ($):</label>
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
                            <label className="form-label">Cantidad de animales:</label>
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
                        <label className="form-label">Ubicación:</label>
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
                        <label className="form-label">Tipo de alojamiento:</label>
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

                    {existingImages.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Imágenes actuales:</label>
                            <div className="existing-images-container">
                                <div className="image-preview-grid">
                                    {existingImages.map((img) => (
                                        <div key={img.id} className="image-preview-item existing-image">
                                            <img 
                                                src={img.url || `http://localhost:3000${img.path}`}
                                                alt="Imagen existente"
                                                className="preview-thumbnail"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => markImageForDeletion(img.id)}
                                                className="remove-image-btn"
                                                title="Eliminar imagen"
                                            >
                                                ✕
                                            </button>
                                            <span className="image-label">Existente</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-group file-upload-group">
                        <label className="form-label">
                            Agregar nuevas fotos (Máx. 5 en total):
                        </label>
                        
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                name="images" 
                                onChange={handleFileChange}
                                multiple 
                                accept="image/*" 
                                className="form-input file-input"
                                id="file-input-edit"
                                disabled={existingImages.length + files.length >= 5}
                            />
                            <label 
                                htmlFor="file-input-edit" 
                                className={`file-input-label ${existingImages.length + files.length >= 5 ? 'disabled' : ''}`}
                            >
                                {existingImages.length + files.length >= 5 
                                    ? '🚫 Máximo de imágenes alcanzado' 
                                    : '📁 Agregar más imágenes'
                                }
                            </label>
                        </div>

                        <p className="file-count">
                            Total: {existingImages.length + files.length} imagen(es) 
                            ({5 - (existingImages.length + files.length)} restante(s))
                        </p>

                        {files.length > 0 && (
                            <div className="image-preview-container">
                                <p className="file-count-label">Nuevas imágenes a subir:</p>
                                <div className="image-preview-grid">
                                    {files.map((file, index) => (
                                        <div key={index} className="image-preview-item new-image">
                                            <img 
                                                src={URL.createObjectURL(file)} 
                                                alt={`Preview ${index + 1}`}
                                                className="preview-thumbnail"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="remove-image-btn"
                                                title="Eliminar imagen"
                                            >
                                                ✕
                                            </button>
                                            <span className="image-label new-label">Nueva</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (<div className="error-message">{error}</div>)}

                    <div className="form-buttons">
                        <button 
                            type="button" 
                            onClick={cancelEdit}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Actualizando...' : 'Actualizar Publicación'}
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
                
                {!editingProfile ? (
                    <div className="perfil-card">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            {user?.perfilImage ? (
                                <img 
                                    src={`http://localhost:3000${user.perfilImage}`}
                                    alt="Foto de perfil"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid #f97840'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    fontSize: '48px'
                                }}>
                                    👤
                                </div>
                            )}
                        </div>

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
                            <p className="field-value">{user?.telefono || 'No especificado'}</p>
                        </div>
                        <div className="perfil-field">
                            <label className="field-label">Documento:</label>
                            <p className="field-value">
                                {user?.tipoDocumento || 'DNI'} {user?.nroDocumento || 'No especificado'}
                            </p>
                        </div>
                        <div className="perfil-field">
                            <label className="field-label">Sexo:</label>
                            <p className="field-value">{user?.sexoCuidador || 'No especificado'}</p>
                        </div>
                        <div className="perfil-field">
                            <label className="field-label">Descripción:</label>
                            <p className="field-value field-description">
                                {user?.descripcion || 'Sin descripción personalizada'}
                            </p>
                        </div>
                        <button 
                            onClick={startEditProfile}
                            className="btn-primary"
                        >
                            ✏️ Editar Perfil
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile} className="form-card">
                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <label className="form-label">Foto de perfil:</label>
                            <div style={{ margin: '15px 0' }}>
                                {profileImage ? (
                                    <img 
                                        src={URL.createObjectURL(profileImage)}
                                        alt="Preview"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '3px solid #3b82f6'
                                        }}
                                    />
                                ) : user?.perfilImage ? (
                                    <img 
                                        src={`http://localhost:3000${user.perfilImage}`}
                                        alt="Foto actual"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '3px solid #3b82f6'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        backgroundColor: '#e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto',
                                        fontSize: '48px'
                                    }}>
                                        👤
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageChange}
                                className="form-input"
                                style={{ marginTop: '10px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre:</label>
                            <input
                                type="text"
                                name="nombre"
                                value={profileFormData.nombre}
                                onChange={handleProfileChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={profileFormData.email}
                                onChange={handleProfileChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Teléfono:</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={profileFormData.telefono}
                                onChange={handleProfileChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Tipo de documento:</label>
                                <select
                                    name="tipoDocumento"
                                    value={profileFormData.tipoDocumento}
                                    onChange={handleProfileChange}
                                    className="form-select"
                                >
                                    <option value="DNI">DNI</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Número de documento:</label>
                                <input
                                    type="text"
                                    name="nroDocumento"
                                    value={profileFormData.nroDocumento}
                                    onChange={handleProfileChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Sexo:</label>
                            <select
                                name="sexoCuidador"
                                value={profileFormData.sexoCuidador}
                                onChange={handleProfileChange}
                                className="form-select"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descripción personal:</label>
                            <textarea
                                name="descripcion"
                                value={profileFormData.descripcion}
                                onChange={handleProfileChange}
                                rows={4}
                                className="form-textarea"
                                placeholder="Cuéntanos sobre ti, tu experiencia con mascotas, etc."
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-buttons">
                            <button
                                type="button"
                                onClick={cancelEditProfile}
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
                )}
            </div>
        </div>
    );     
    

    return (
        <div className="dashboard-container">
            <nav className="dashboard-navbar">
                <div className="navbar-brand">
                    <h1 className="navbar-title">PetsBnB - Cuidador</h1>
                    <span className="navbar-welcome">Bienvenido, {user?.nombre}</span>
                </div>
                
                <div className="navbar-buttons">
                    <div className="up-buttons">
                    <button
                        onClick={() => navigate('/')} 
                        className="nav-button btn-publicaciones-extra"
                    >
                        <Home size={18} style={{marginRight: '5px'}}/>
                        Demás Publicaciones
                    </button>
                    <button
                        onClick={() => setCurrentView('publicaciones')}
                        className={`nav-button ${currentView === 'publicaciones' ? 'active' : ''}`}
                    >
                        Mis Publicaciones
                    </button>
                    <button
                        onClick={() => setCurrentView('reservas')}
                        className={`nav-button ${currentView === 'reservas' ? 'active' : ''}`}
                    >  <CalendarCheck size={18} style={{marginRight: '5px'}}/>
                        Reservas
                    </button>
                    </div>
                    <div className="down-buttons">
                    <button
                        onClick={() => setCurrentView('perfil')}
                        className={`nav-button ${currentView === 'perfil' ? 'active' : ''}`}
                    >
                        <User size={18} style={{marginRight: '5px'}}/>
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="logout-button"
                    >   <LogOut size={18} style={{marginRight: '5px'}}/>
                    </button>
                    </div>
                </div>
            </nav>

            <main>
                {currentView === 'publicaciones' && renderPublicaciones()}
                {currentView === 'reservas' && renderReservas()}
                {currentView === 'perfil' && renderPerfil()}
                {currentView === 'nueva-publicacion' && renderNuevaPublicacion()}
                {currentView === 'editar-publicacion' && renderEditarPublicacion()}
            </main>
        </div>
    );
};

export default CuidadorDashboard;