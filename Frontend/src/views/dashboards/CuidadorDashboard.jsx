import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, X, AlertCircle, Upload, Trash2, Home, CalendarCheck, User, LogOut } from 'lucide-react';
import PublicacionesGrid from '../../components/PublicacionesGrid';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/DashboardCuidador.css';

const API_BASE_URL = 'http://localhost:3000/api';

// Componente de Calendario para selección múltiple de fechas
const DisponibilidadCalendar = ({ onDateSelect, blockedDates = [], publicacionId }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        return { daysInMonth, startingDayOfWeek };
    };

    const isDateInPast = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isDateBlocked = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return blockedDates.includes(dateStr);
    };

    const isDateSelected = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return selectedDates.includes(dateStr);
    };

    const handleDateClick = (date) => {
        if (isDateInPast(date)) return;

        const dateStr = date.toISOString().split('T')[0];

        setSelectedDates(prev => {
            const newDates = prev.includes(dateStr)
                ? prev.filter(d => d !== dateStr)
                : [...prev, dateStr];
            onDateSelect(newDates);
            return newDates;
        });
    };

    const renderCalendar = (monthOffset = 0) => {
        const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(displayMonth);
        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day-empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
            const inPast = isDateInPast(date);
            const blocked = isDateBlocked(date);
            const selected = isDateSelected(date);

            const classNames = [
                'calendar-day',
                inPast && 'calendar-day-past',
                blocked && 'calendar-day-blocked',
                selected && 'calendar-day-selected'
            ].filter(Boolean).join(' ');

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(date)}
                    className={classNames}
                    title={blocked ? 'Ya reservado' : selected ? 'Click para desbloquear' : 'Click para bloquear'}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="disponibilidad-calendar">
            <div className="calendar-header">
                <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="calendar-nav-btn"
                >
                    ←
                </button>
                <span className="calendar-month-title">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="calendar-nav-btn"
                >
                    →
                </button>
            </div>

            <div className="calendar-grid-container">
                {[0, 1].map(offset => (
                    <div key={offset} className="calendar-month-grid">
                        <div className="calendar-weekdays">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                <div key={day} className="calendar-weekday">{day}</div>
                            ))}
                        </div>
                        <div className="calendar-days-grid">
                            {renderCalendar(offset)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-icon legend-icon-blocked"></div>
                    <span>Ya reservado (no modificable)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon legend-icon-selected"></div>
                    <span>Fecha bloqueada por ti</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon legend-icon-available"></div>
                    <span>Disponible</span>
                </div>
            </div>

            {selectedDates.length > 0 && (
                <div className="calendar-selection-summary">
                    <strong>{selectedDates.length}</strong> fecha{selectedDates.length !== 1 ? 's' : ''} para bloquear
                </div>
            )}
        </div>
    );
};

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
    const { user, logout, updateUser } = useAuth();
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
    const [files, setFiles] = useState([]);

    // Estados para disponibilidad
    const [showCalendar, setShowCalendar] = useState(false);
    const [diasReservados, setDiasReservados] = useState([]);
    const [fechasABloquear, setFechasABloquear] = useState([]);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        tarifaPorDia: '',
        ubicacion: '',
        tipoAlojamiento: '',
        cantAnimales: '',
        exotico: false
    });

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
            console.log('✅ Respuesta del servidor:', data);

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
            setError('');

        } catch (error) {
            console.error('❌ Error al actualizar perfil:', error);
            setError(error.message || 'Error al actualizar el perfil');
            alert('❌ ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const newlySelectedFiles = Array.from(e.target.files);
        const existingFiles = files;
        const allFiles = [...existingFiles, ...newlySelectedFiles];

        const uniqueFilesMap = new Map();
        allFiles.forEach(file => {
            const key = `${file.name}-${file.size}-${file.lastModified}`;
            if (!uniqueFilesMap.has(key)) {
                uniqueFilesMap.set(key, file);
            }
        });

        const arrayUniqueFiles = Array.from(uniqueFilesMap.values());
        const limitedFiles = arrayUniqueFiles.slice(0, 5);

        if (arrayUniqueFiles.length > 5) {
            alert(`Solo puedes subir un máximo de 5 imágenes. Se han mantenido los últimos 5 archivos únicos.`);
        }

        setFiles(limitedFiles);
        e.target.value = null;
    };

    const removeFile = (indexToRemove) => {
        console.log(`🗑️ Archivo a remover: ${files[indexToRemove]?.name}`);
        const newFiles = files.filter((_, index) => index !== indexToRemove);
        console.log(`📦 Archivos restantes: ${newFiles.length}`);
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
            console.log('DB Response:', data.publicaciones);
            setPublicaciones(Array.isArray(data.publicaciones) ? data.publicaciones : []);
        } catch (err) {
            setError('Error al cargar publicaciones: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.idUsuario]);

    const fetchReservas = useCallback(async () => {
        if (!user?.idUsuario) return;
        try {
            const response = await fetch(`${API_BASE_URL}/reservas`, {
                credentials: 'include'
            });
            const data = await response.json();
            const reservasCuidador = data.data.filter(r =>
                r.publicacion?.idCuidador?.idUsuario === user.idUsuario
            );
            setReservas(reservasCuidador);
        } catch (err) {
            console.error('Error:', err);
        }
    }, [user?.idUsuario]);

    const fetchDiasReservados = async (publicacionId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/publicacion/dias-reservados/${publicacionId}`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Error al cargar fechas');
            const data = await response.json();
            setDiasReservados(data.data || []);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleDateSelect = useCallback((dates) => {
        setFechasABloquear(dates);
    }, []);

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

    useEffect(() => {
        if (editingPublicacion?.id) {
            fetchDiasReservados(editingPublicacion.id);
        }
    }, [editingPublicacion]);

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
            console.log(`Agregando ${index + 1}/${files.length}: ${file.name} (${file.size} bytes)`);
            formDataPayload.append('images', file, file.name);
        });

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
            alert('✅ Publicación creada exitosamente');
        } catch (err) {
            console.error('Error al crear publicación:', err);
            setError('Error al crear publicación: ' + err.message);
            alert('❌ Error al crear publicación: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm('🚨 ADVERTENCIA: Esta acción es irreversible. ¿Estás absolutamente seguro de que quieres ELIMINAR tu cuenta? Se eliminarán todas tus publicaciones y reservas.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userId = user.idUsuario;
            if (!userId) {
                throw new Error('ID de usuario no encontrado.');
            }

            const response = await fetch(
                `${API_BASE_URL}/cuidador/${userId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status} al eliminar la cuenta.`);
            }

            await logout();
            alert('✅ Cuenta eliminada exitosamente. Serás redirigido.');
            navigate('/');

        } catch (error) {
            console.error('❌ Error al eliminar la cuenta:', error);
            setError(error.message || 'Error al eliminar la cuenta. Inténtalo de nuevo.');
            alert('❌ Error: ' + (error.message || 'No se pudo eliminar la cuenta.'));
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
        if (!id || id === undefined || id === null) {
            alert('❌ Error: No se puede eliminar - ID inválido');
            console.error('🚨 ID inválido:', id);
            return;
        }

        console.log('🗑️ Intentando eliminar publicación con ID:', id);

        if (!window.confirm(`⚠️ ¿Estás seguro de eliminar esta publicación?\n\nID: ${id}\n\nEsta acción es irreversible.`)) {
            console.log('❌ Usuario canceló la eliminación');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const url = `${API_BASE_URL}/publicacion/${id}`;
            console.log('🌐 Enviando DELETE a:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Error data:', errorData);
                throw new Error(errorData.message || `Error ${response.status}: No se pudo eliminar la publicación.`);
            }

            const responseData = await response.json().catch(() => null);
            console.log('✅ Respuesta del servidor:', responseData);

            await fetchPublicaciones();

            alert('✅ Publicación eliminada exitosamente');
            console.log('✅ Publicación eliminada correctamente');

        } catch (err) {
            console.error('❌ Error al eliminar:', err);
            setError('Error al eliminar publicación: ' + err.message);
            alert('❌ Error al eliminar publicación: ' + err.message);
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
        setShowCalendar(false);
        setFechasABloquear([]);
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
        setShowCalendar(false);
        setFechasABloquear([]);
        setDiasReservados([]);
        setCurrentView('publicaciones');
    };

    const handleBloquearFechas = async () => {
        if (fechasABloquear.length === 0) {
            alert('⚠️ Selecciona al menos una fecha para bloquear');
            return;
        }

        setLoading(true);
        try {
            
            const reservaBloqueo = {
                fechaReserva: new Date().toISOString(),
                descripcion: '🔒 Fechas bloqueadas por el cuidador',
                idPublicacion: editingPublicacion.id,
                dias: fechasABloquear,
                fechaDesde: new Date(Math.min(...fechasABloquear.map(d => new Date(d)))).toISOString(),
                fechaHasta: new Date(Math.max(...fechasABloquear.map(d => new Date(d)))).toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/reservas`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservaBloqueo)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al bloquear fechas');
            }

            alert('✅ Fechas bloqueadas exitosamente');
            setFechasABloquear([]);
            await fetchDiasReservados(editingPublicacion.id);
        } catch (err) {
            alert('❌ Error: ' + err.message);
        } finally {
            setLoading(false);
        }
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
            alert('✅ Publicación actualizada exitosamente!');

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
            alert(`✅ Reserva ${nuevoEstado === 'confirmada' ? 'aceptada' : 'rechazada'} exitosamente`);
        } catch (err) {
            alert('❌ Error al actualizar reserva: ' + err.message);
        }
    };

    const renderPublicaciones = () => {
        const renderDashboardActions = (pub) => {
            return (
                <>
                    <button
                        onClick={() => startEditPublicacion(pub)}
                        className="btn-edit"
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={() => deletePublicacion(pub.id)}
                        className="btn-delete"
                    >
                        🗑️ Eliminar
                    </button>
                </>
            );
        };

        return (
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

                <PublicacionesGrid
                    publicaciones={publicaciones}
                    loading={loading}
                    error={error}
                    onRetry={fetchPublicaciones}
                    renderCardActions={renderDashboardActions}
                    emptyMessage="Aún no tienes publicaciones"
                    showCuidadorInfo={false}
                />
            </div>
        );
    };

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
                                📁 Seleccionar imágenes
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

    const renderEditarPublicacion = () => {
        const totalImages = existingImages.length + files.length;

        return (
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
                                                    <Trash2 size={16} />
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
                                    disabled={totalImages >= 5}
                                />
                                <label
                                    htmlFor="file-input-edit"
                                    className={`file-input-label ${totalImages >= 5 ? 'disabled' : ''}`}
                                >
                                    {totalImages >= 5
                                        ? '🚫 Máximo alcanzado'
                                        : '📁 Agregar más imágenes'
                                    }
                                </label>
                            </div>

                            <p className="file-count">
                                Total: {totalImages} imagen(es) ({5 - totalImages} restante(s))
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
                                                    <X size={16} />
                                                </button>
                                                <span className="image-label new-label">Nueva</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección de Disponibilidad */}
                        <div className="disponibilidad-section">
                            <div className="disponibilidad-header">
                                <Calendar size={20} className="icon-calendar" />
                                <h3>Gestionar Disponibilidad</h3>
                            </div>
                            <p className="disponibilidad-description">
                                Bloquea fechas en las que no puedas recibir mascotas
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="btn-toggle-calendar"
                            >
                                {showCalendar ? '🙈 Ocultar' : '📅 Mostrar'} Calendario
                            </button>

                            {diasReservados.length > 0 && (
                                <div className="reservas-alert">
                                    <AlertCircle size={16} />
                                    <span>Hay <strong>{diasReservados.length}</strong> fechas reservadas</span>
                                </div>
                            )}
                        </div>

                        {showCalendar && (
                            <div className="calendar-section">
                                <DisponibilidadCalendar
                                    onDateSelect={handleDateSelect}
                                    blockedDates={diasReservados}
                                    publicacionId={editingPublicacion.id}
                                />
                                <button
                                    type="button"
                                    onClick={handleBloquearFechas}
                                    disabled={fechasABloquear.length === 0 || loading}
                                    className="btn-bloquear-fechas"
                                >
                                    {loading ? '⏳ Bloqueando...' : `🔒 Bloquear ${fechasABloquear.length || 0} fecha${fechasABloquear.length !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        )}

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
                                {loading ? 'Actualizando...' : '💾 Actualizar Publicación'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderReservas = () => {
        const [expandedReserva, setExpandedReserva] = useState(null);
        const [filterStatus, setFilterStatus] = useState('todas');

        const toggleExpand = (reservaId) => {
            setExpandedReserva(expandedReserva === reservaId ? null : reservaId);
        };

        const reservasFiltradas = filterStatus === 'todas'
            ? reservas
            : reservas.filter(r => (r.estado || 'pendiente') === filterStatus);

        return (
            <div className="dashboard-main">
                <div className="reservas-header">
                    <h2 className="section-title">Reservas Recibidas</h2>

                    <div className="reservas-filters">
                        <button
                            onClick={() => setFilterStatus('todas')}
                            className={`filter-btn ${filterStatus === 'todas' ? 'active' : ''}`}
                        >
                            Todas ({reservas.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('pendiente')}
                            className={`filter-btn ${filterStatus === 'pendiente' ? 'active' : ''}`}
                        >
                            Pendientes ({reservas.filter(r => (r.estado || 'pendiente') === 'pendiente').length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('confirmada')}
                            className={`filter-btn ${filterStatus === 'confirmada' ? 'active' : ''}`}
                        >
                            Confirmadas ({reservas.filter(r => r.estado === 'confirmada').length})
                        </button>
                    </div>
                </div>

                {loading && <div className="loading-message">Cargando reservas...</div>}
                {error && <div className="error-message">{error}</div>}

                {!Array.isArray(reservasFiltradas) ? (
                    <div className="error-message">Error: Datos de reservas inválidos.</div>
                ) : reservasFiltradas.length === 0 && !loading ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <h3>
                            {filterStatus === 'todas'
                                ? 'No has recibido reservas aún'
                                : `No hay reservas ${filterStatus === 'pendiente' ? 'pendientes' : 'confirmadas'}`
                            }
                        </h3>
                        <p>Tus publicaciones aparecerán en la búsqueda de los dueños</p>
                    </div>
                ) : (
                    <div className="reservas-grid">
                        {reservasFiltradas.map((reserva) => {
                            const reservaId = reserva.id || reserva.idReserva;
                            const isExpanded = expandedReserva === reservaId;
                            const publicacion = reserva.publicacion;
                            const dueno = reserva.dueno;
                            const primeraImagen = publicacion?.imagenes?.[0];

                            return (
                                <div key={reservaId} className="reserva-card-expanded reserva-cuidador">
                                    <div className="reserva-header-with-image">
                                        {primeraImagen ? (
                                            <div className="reserva-publicacion-image">
                                                <img
                                                    src={primeraImagen.url || `http://localhost:3000${primeraImagen.path}`}
                                                    alt={publicacion?.titulo || 'Publicación'}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="reserva-image-placeholder" style={{ display: 'none' }}>🏠</div>
                                            </div>
                                        ) : (
                                            <div className="reserva-publicacion-image">
                                                <div className="reserva-image-placeholder">🏠</div>
                                            </div>
                                        )}

                                        <div className="reserva-header-info">
                                            <h3>{publicacion?.titulo || 'Sin título'}</h3>
                                            <p className="reserva-dueno-info">
                                                <strong>Dueño:</strong> {dueno?.nombre || 'N/A'}
                                            </p>
                                            {dueno?.telefono && (
                                                <p className="reserva-dueno-contacto">📱 {dueno.telefono}</p>
                                            )}
                                            <span className={`status-badge status-${reserva.estado || 'pendiente'}`}>
                                                {(reserva.estado || 'PENDIENTE').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="reserva-info">
                                        <div className="reserva-date-range">
                                            <div className="date-item">
                                                <span className="date-label">Check-in</span>
                                                <span className="date-value">
                                                    {reserva.fechaDesde ? new Date(reserva.fechaDesde).toLocaleDateString('es-AR') : reserva.fechaInicio || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="date-separator">→</div>
                                            <div className="date-item">
                                                <span className="date-label">Check-out</span>
                                                <span className="date-value">
                                                    {reserva.fechaHasta ? new Date(reserva.fechaHasta).toLocaleDateString('es-AR') : reserva.fechaFin || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="reserva-price">
                                            <span className="price-label">Ganancia estimada</span>
                                            <span className="price-value">
                                                ${reserva.total || (publicacion?.tarifaPorDia ? publicacion.tarifaPorDia * Math.ceil((new Date(reserva.fechaHasta) - new Date(reserva.fechaDesde)) / (1000 * 60 * 60 * 24)) : 'N/A')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="reserva-mascotas-preview">
                                        <strong>Mascotas a cuidar:</strong>
                                        <div className="mascotas-thumbnails">
                                            {reserva.mascotas && reserva.mascotas.length > 0 ? (
                                                reserva.mascotas.map((mascota, idx) => (
                                                    <div key={idx} className="mascota-thumb" title={`${mascota.nombre || mascota.nomMascota} - ${mascota.especie}`}>
                                                        {mascota.imagen ? (
                                                            <img
                                                                src={mascota.imagen}
                                                                alt={mascota.nombre || mascota.nomMascota}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className="mascota-thumb-placeholder" style={{ display: mascota.imagen ? 'none' : 'flex' }}>
                                                            {mascota.exotico ? '🦎' : '🐕'}
                                                        </div>
                                                        <span className="mascota-thumb-name">{mascota.nombre || mascota.nomMascota}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="no-data">No especificado</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleExpand(reservaId)}
                                        className="btn-expand"
                                    >
                                        {isExpanded ? '▲ Ver menos' : '▼ Ver más detalles'}
                                    </button>

                                    {isExpanded && (
                                        <div className="reserva-expanded-details">
                                            <div className="detail-section">
                                                <h4>Información del Dueño</h4>
                                                <p><strong>Nombre:</strong> {dueno?.nombre || 'N/A'}</p>
                                                <p><strong>Email:</strong> {dueno?.email || 'N/A'}</p>
                                                {dueno?.telefono && <p><strong>Teléfono:</strong> {dueno.telefono}</p>}
                                            </div>

                                            {reserva.descripcion && (
                                                <div className="detail-section">
                                                    <h4>Notas del Dueño</h4>
                                                    <p>{reserva.descripcion}</p>
                                                </div>
                                            )}

                                            <div className="detail-section">
                                                <h4>Detalles de las Mascotas</h4>
                                                <div className="mascotas-detail-list">
                                                    {reserva.mascotas && reserva.mascotas.map((mascota, idx) => (
                                                        <div key={idx} className="mascota-detail-item">
                                                            <div className="mascota-detail-image">
                                                                {mascota.imagen ? (
                                                                    <img
                                                                        src={mascota.imagen}
                                                                        alt={mascota.nombre || mascota.nomMascota}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <div className="mascota-detail-placeholder" style={{ display: mascota.imagen ? 'none' : 'flex' }}>
                                                                    {mascota.exotico ? '🦎' : '🐕'}
                                                                </div>
                                                            </div>
                                                            <div className="mascota-detail-info">
                                                                <h5>{mascota.nombre || mascota.nomMascota}</h5>
                                                                <p><strong>Especie:</strong> {mascota.especie}</p>
                                                                <p><strong>Raza:</strong> {mascota.raza}</p>
                                                                <p><strong>Edad:</strong> {mascota.edad} años</p>
                                                                <p><strong>Sexo:</strong> {mascota.sexo === 'M' ? 'Macho' : 'Hembra'}</p>
                                                                {mascota.exotico && (
                                                                    <p className="exotic-tag">✨ Mascota Exótica</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="detail-section">
                                                <h4>Fechas Específicas Reservadas</h4>
                                                <div className="dias-reservados-list">
                                                    {reserva.diasReservados && reserva.diasReservados.length > 0 ? (
                                                        <div className="dias-grid">
                                                            {reserva.diasReservados.map((dia, idx) => (
                                                                <span key={idx} className="dia-badge">
                                                                    {new Date(dia).toLocaleDateString('es-AR', {
                                                                        day: 'numeric',
                                                                        month: 'short'
                                                                    })}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="no-data">No especificado</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(reserva.estado === 'pendiente' || !reserva.estado) && (
                                        <div className="reserva-actions">
                                            <button
                                                onClick={() => updateReservaEstado(reserva.id, 'rechazada')}
                                                className="btn-reject"
                                            >
                                                ✕ Rechazar
                                            </button>
                                            <button
                                                onClick={() => updateReservaEstado(reservaId, 'confirmada')}
                                                className="btn-accept"
                                            >
                                                ✓ Aceptar Reserva
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderPerfil = () => (
        <div className="dashboard-main">
            <div className="perfil-container">
                <h2 className="section-title">Mi Perfil</h2>

                {!editingProfile ? (
                    <div className="perfil-card">
                        <div className="perfil-image-container">
                            {user?.perfilImage ? (
                                <img
                                    src={`http://localhost:3000${user.perfilImage}`}
                                    alt="Foto de perfil"
                                    className="perfil-image"
                                />
                            ) : (
                                <div className="perfil-placeholder">👤</div>
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
                        <button
                            onClick={handleDeleteUser}
                            className="btn-delete"
                            disabled={loading}
                        >
                            {loading ? 'Eliminando...' : '🗑️ Eliminar Cuenta'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile} className="form-card">
                        <div className="form-group perfil-image-upload">
                            <label className="form-label">Foto de perfil:</label>
                            <div className="profile-image-preview">
                                {profileImage ? (
                                    <img
                                        src={URL.createObjectURL(profileImage)}
                                        alt="Preview"
                                        className="perfil-image"
                                    />
                                ) : user?.perfilImage ? (
                                    <img
                                        src={`http://localhost:3000${user.perfilImage}`}
                                        alt="Foto actual"
                                        className="perfil-image"
                                    />
                                ) : (
                                    <div className="perfil-placeholder">👤</div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageChange}
                                className="form-input"
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
                            <Home size={18} style={{ marginRight: '5px' }} />
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
                        >
                            <CalendarCheck size={18} style={{ marginRight: '5px' }} />
                            Reservas
                        </button>
                    </div>
                    <div className="down-buttons">
                        <button
                            onClick={() => setCurrentView('perfil')}
                            className={`nav-button ${currentView === 'perfil' ? 'active' : ''}`}
                        >
                            <User size={18} style={{ marginRight: '5px' }} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            <LogOut size={18} style={{ marginRight: '5px' }} />
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