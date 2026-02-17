import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import '../../styles/DashboardDueno.css';
import { useNavigate } from 'react-router-dom';
import { Home, PawPrint, CalendarCheck, User, LogOut } from 'lucide-react';
import { useReservas } from '../../hooks/useReservas';
import ReservaCard from '../../components/ReservaCard';


const forceNavbarVisibility = () => {
    const navbar = document.querySelector('#main-dashboard #main-navbar');
    if (navbar) {
        navbar.style.cssText = `
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
        `;

        const buttons = navbar.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.cssText = `
                display: inline-flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: static !important;
            `;
        });
    }
};
const DuenoDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [currentView, setCurrentView] = useState('mascotas');
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [razasFiltradas, setRazasFiltradas] = useState([]);
    const [imageUploading, setImageUploading] = useState(false);
    const navigate = useNavigate();
    const API_BASE_URL = 'http://localhost:3000/api';
    const [profileImageFile, setProfileImageFile] = useState(null);

    useEffect(() => {
        // Forzar visibilidad al montar
        forceNavbarVisibility();

        // Forzar visibilidad cada 100ms durante 1 segundo (por si hay re-renders)
        const intervals = [];
        for (let i = 0; i < 10; i++) {
            intervals.push(setTimeout(forceNavbarVisibility, i * 100));
        }

        return () => intervals.forEach(clearTimeout);
    }, []);

    // 👇 TAMBIÉN agregá esto cada vez que cambia la vista
    useEffect(() => {
        forceNavbarVisibility();
    }, [currentView]);

    const [mascotaImageFile, setMascotaImageFile] = useState(null);

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
        tipoDocumento: user?.tipoDocumento || 'DNI',
        telefonoEmergencia: user?.telefonoEmergencia || '',  // ← agregar
    });
    const [editingPerfil, setEditingPerfil] = useState(false);

    // ─── FIX: filterStatus moved here, out of renderReservas ───────────────────
    const [filterStatus, setFilterStatus] = useState('todas');


    const {
        reservas,
        loading: reservasLoading,
        error: reservasError,
        cancelarReserva,
        getReservasByEstado,      // filtra por 'pendiente' | 'en_curso' | 'todas'
    } = useReservas(user?.idUsuario, 'dueno');



    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrCode2FA, setQrCode2FA] = useState(null);
    const [loading2FA, setLoading2FA] = useState(false);

    // ── Función activar 2FA (igual a cuidador) ──
    const handleActivate2FA = async () => {
        setLoading2FA(true);
        setShow2FAModal(true);
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios/2fa/generate`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
            });
            const data = await response.json();
            if (data.qrDataUrl) {
                setQrCode2FA(data.qrDataUrl);
            } else {
                alert('Error al generar el código QR');
            }
        } catch (err) {
            console.error('Error al generar 2FA:', err);
            alert('Error de conexión al generar 2FA');
        } finally {
            setLoading2FA(false);
        }
    };

    const close2FAModal = () => {
        setShow2FAModal(false);
        setQrCode2FA(null);
    };

    // ─── Redirect to reservas view if coming back from a successful payment ────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fromPayment = params.get('from');

        // Si viene del pago, abrir reservas
        if (fromPayment === 'payment') {
            setCurrentView('reservas');
            // Limpiar la URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

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
        if (!window.confirm('¿Estás seguro de eliminar la imagen de esta mascota?')) return;
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
        if (!file.type.startsWith('image/')) { alert('Por favor selecciona un archivo de imagen válido'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('El archivo es muy grande. Máximo 5MB permitido'); return; }
        try {
            await uploadMascotaImage(mascotaId, file);
            alert('Imagen subida exitosamente');
        } catch (error) {
            alert('Error al subir imagen: ' + error.message);
        }
        event.target.value = '';
    };

    const handleMascotaImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) { alert('Por favor selecciona un archivo de imagen válido'); return; }
            if (file.size > 5 * 1024 * 1024) { alert('El archivo es muy grande. Máximo 5MB permitido'); return; }
            setMascotaImageFile(file);
        }
    };

    const deleteMascotaImageFromForm = async () => {
        if (!editingMascota?.idMascota) { setMascotaImageFile(null); return; }
        try {
            setImageUploading(true);
            const response = await fetch(`${API_BASE_URL}/mascotas/${editingMascota.idMascota}/imagen`, {
                method: 'DELETE', credentials: 'include'
            });
            if (!response.ok) throw new Error('Error al eliminar imagen');
            setEditingMascota(prev => ({ ...prev, imagen: null, fotoPerfil: null }));
            setMascotaImageFile(null);
            alert('Imagen de mascota eliminada.');
        } catch (error) {
            console.error('Error al eliminar imagen de mascota:', error);
            alert('Error: ' + error.message);
        } finally {
            setImageUploading(false);
        }
    };

    const handleProfileImageChange = (e) => {
        if (e.target.files && e.target.files[0]) setProfileImageFile(e.target.files[0]);
    };

    const uploadDuenoProfileImage = async () => {
        if (!profileImageFile) return user.perfilImage;
        setImageUploading(true);
        const formData = new FormData();
        formData.append('profileImage', profileImageFile);
        try {
            const response = await fetch(`${API_BASE_URL}/duenos/${user.idUsuario}/profile-image`, {
                method: 'POST', body: formData, credentials: 'include'
            });
            if (!response.ok) {
                const imgError = await response.json().catch(() => ({}));
                throw new Error(imgError.message || 'Error al actualizar la imagen');
            }
            const imageData = await response.json();
            return imageData.data.perfilImage;
        } catch (error) {
            console.error('Error al subir imagen de perfil:', error);
            throw error;
        } finally {
            setImageUploading(false);
        }
    };

    const deleteDuenoProfileImage = async () => {
        try {
            setImageUploading(true);
            const response = await fetch(`${API_BASE_URL}/duenos/${user.idUsuario}/profile-image`, {
                method: 'DELETE', credentials: 'include'
            });
            if (!response.ok) throw new Error('Error al eliminar imagen');
            updateUser({ ...user, perfilImage: undefined });
            setProfileImageFile(null);
            alert('Imagen de perfil eliminada.');
        } catch (error) {
            console.error('Error al eliminar imagen de perfil:', error);
            alert('Error: ' + error.message);
        } finally {
            setImageUploading(false);
        }
    };

    useEffect(() => {
        fetchEspecies();
        fetchRazas();
    }, []);

    useEffect(() => {
        if (mascotaForm.idEspecie) {
            const especieId = parseInt(mascotaForm.idEspecie);
            setRazasFiltradas(razas.filter(raza => parseInt(raza.idEspecie) === especieId));
        } else {
            setRazasFiltradas([]);
        }
    }, [mascotaForm.idEspecie, razas]);

    const fetchMascotas = useCallback(async () => {
        if (!user?.idUsuario) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/mascotas/duenos/${user.idUsuario}`, {
                method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' }
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
                setError(`Error del servidor: ${response.status}`);
                setMascotas([]);
            }
        } catch (err) {
            setError('Error de conexión al cargar mascotas');
            setMascotas([]);
        } finally {
            setLoading(false);
        }
    }, [user?.idUsuario]);

    const fetchEspecies = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/especies`, {
                method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                const especiesArray = data.data || data.especies || data || [];
                if (especiesArray.length === 0) { setError('Advertencia: No se encontraron especies.'); return; }
                setEspecies(especiesArray.map(e => ({ id: e.idEspecie || e.id, nombre: e.nomEspecie || e.nombre })));
            }
        } catch (err) {
            setError('Error de conexión al cargar especies.');
        }
    };

    const fetchRazas = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/razas`, {
                method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                let razasArray = data.data || data.razas || data || [];
                setRazas(razasArray.map(raza => {
                    let especieId;
                    if (raza.especie && (raza.especie.idEspecie || raza.especie.id)) especieId = raza.especie.idEspecie || raza.especie.id;
                    else if (raza.idEspecie) especieId = raza.idEspecie;
                    else if (raza.especie && typeof raza.especie === 'number') especieId = raza.especie;
                    return { id: raza.idRaza || raza.id, nombre: raza.nomRaza || raza.nombre, idEspecie: especieId ? String(especieId) : '' };
                }));
            }
        } catch (err) {
            setError(prev => prev + ' | Error de conexión al cargar razas.');
        }
    };


    // ============================================================================
    // REEMPLAZO COMPLETO de handleMascotaSubmit en DuenoDashboard.jsx
    // ============================================================================

    const handleMascotaSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // ============================================================================
        // VALIDACIONES FRONTEND
        // ============================================================================

        // 1. Validar nombre
        if (!mascotaForm.nombre || mascotaForm.nombre.trim() === '') {
            setError('Por favor, ingresa el nombre de la mascota.');
            setLoading(false);
            return;
        }

        // 2. Validar edad
        const edadNumerica = parseInt(mascotaForm.edad, 10);
        if (isNaN(edadNumerica) || edadNumerica <= 0 || edadNumerica > 30) {
            setError('Por favor, ingresa una edad válida (entre 1 y 30 años).');
            setLoading(false);
            return;
        }

        // 3. Validar peso
        const pesoNumerico = parseFloat(mascotaForm.peso);
        if (isNaN(pesoNumerico) || pesoNumerico <= 0 || pesoNumerico > 200) {
            setError('Por favor, ingresa un peso válido (entre 0.1 y 200 kg).');
            setLoading(false);
            return;
        }

        // 4. Validar sexo
        if (!mascotaForm.sexo || (mascotaForm.sexo !== 'M' && mascotaForm.sexo !== 'F')) {
            setError('Por favor, selecciona el sexo de la mascota (Macho o Hembra).');
            setLoading(false);
            return;
        }

        // 5. Validar especie
        if (!mascotaForm.idEspecie) {
            setError('Por favor, selecciona una especie.');
            setLoading(false);
            return;
        }

        const especieId = parseInt(mascotaForm.idEspecie);
        if (isNaN(especieId)) {
            setError('Especie inválida. Por favor, selecciona nuevamente.');
            setLoading(false);
            return;
        }

        // 6. Validar raza
        if (!mascotaForm.idRaza) {
            setError('Por favor, selecciona una raza.');
            setLoading(false);
            return;
        }

        const razaId = parseInt(mascotaForm.idRaza);
        if (isNaN(razaId)) {
            setError('Raza inválida. Por favor, selecciona nuevamente.');
            setLoading(false);
            return;
        }

        // ============================================================================
        // PREPARAR DATOS PARA ENVIAR
        // ============================================================================

        try {
            const url = editingMascota
                ? `${API_BASE_URL}/mascotas/${editingMascota.idMascota || editingMascota.id}`
                : `${API_BASE_URL}/mascotas`;

            const method = editingMascota ? 'PUT' : 'POST';

            // ✅ DATOS LIMPIOS Y VALIDADOS
            const mascotaData = {
                nomMascota: mascotaForm.nombre.trim(),
                edad: mascotaForm.edad.toString(), // Backend espera string
                sexo: mascotaForm.sexo,
                exotico: Boolean(mascotaForm.exotico),
                descripcion: mascotaForm.descripcion.trim() || 'Sin descripción', // ✅ FIX: nunca enviar string vacío
                peso: pesoNumerico,
                especie: especieId,
                raza: razaId,
                dueno: parseInt(user.idUsuario)
            };

            // Si estamos editando, agregar el ID
            if (editingMascota) {
                mascotaData.idMascota = editingMascota.idMascota;
            }

            console.log('📤 Enviando datos de mascota:', mascotaData);

            // ============================================================================
            // ENVIAR REQUEST
            // ============================================================================

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mascotaData)
            });

            // ============================================================================
            // MANEJAR RESPUESTA
            // ============================================================================

            if (!response.ok) {
                const errorData = await response.json().catch(async () => {
                    const text = await response.text();
                    return { message: text || `Error ${response.status}` };
                });

                // Mostrar error específico del backend
                console.error('❌ Error del servidor:', errorData);
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Respuesta del servidor:', result);

            const mascotaId = result.data.idMascota || editingMascota?.idMascota;

            // ============================================================================
            // SUBIR IMAGEN SI EXISTE
            // ============================================================================

            if (mascotaImageFile && mascotaId) {
                try {
                    await uploadMascotaImage(mascotaId, mascotaImageFile);
                    console.log('✅ Imagen subida correctamente');
                } catch (imgError) {
                    console.warn('⚠️ Mascota guardada pero error al subir imagen:', imgError);
                    alert('⚠️ Mascota guardada pero hubo un error al subir la imagen: ' + imgError.message);
                }
            }

            // ============================================================================
            // ACTUALIZAR LISTA Y LIMPIAR FORMULARIO
            // ============================================================================

            await fetchMascotas();

            alert(editingMascota
                ? '✅ Mascota actualizada exitosamente!'
                : '✅ Mascota creada exitosamente!'
            );

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
            setMascotaImageFile(null);
            setEditingMascota(null);
            setCurrentView('mascotas');

        } catch (err) {
            console.error('❌ Error al guardar mascota:', err);
            setError('Error al guardar mascota: ' + err.message);

            // Mostrar alert con el error específico
            alert('❌ Error al guardar mascota:\n\n' + err.message +
                '\n\nPor favor, verifica que:\n' +
                '• La especie y raza existan en la base de datos\n' +
                '• La raza pertenezca a la especie seleccionada\n' +
                '• Todos los campos estén completos'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.idUsuario) {
            fetchMascotas();
        }
    }, [user?.idUsuario, fetchMascotas]);

    useEffect(() => {
        if (user) {
            setPerfilForm({
                nombre: user?.nombre || '',
                email: user?.email || '',
                telefono: user?.telefono || '',
                nroDocumento: user?.nroDocumento || '',
                tipoDocumento: user?.tipoDocumento || 'DNI',
                telefonoEmergencia: user?.telefonoEmergencia || '',  // ← agregar
            });
        }
    }, [user]);

    const handlePerfilFormChange = (e) => setPerfilForm({ ...perfilForm, [e.target.name]: e.target.value });

    const handleDeleteUser = async () => {
        if (!window.confirm('🚨 ADVERTENCIA: Esta acción es IRREVERSIBLE. ¿Estás absolutamente seguro?')) return;
        setLoading(true);
        setError('');
        try {
            const userId = user.idUsuario;
            if (!userId) throw new Error('ID de usuario no encontrado.');
            const response = await fetch(`${API_BASE_URL}/duenos/${userId}`, { method: 'DELETE', credentials: 'include' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status} al eliminar la cuenta.`);
            }
            await logout();
            alert('✅ Cuenta eliminada exitosamente.');
            navigate('/');
        } catch (error) {
            setError(error.message || 'Error al eliminar la cuenta.');
            alert('Error: ' + (error.message || 'No se pudo eliminar la cuenta.'));
        } finally {
            setLoading(false);
        }
    };

    const handlePerfilSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let updatedImagePath = user?.perfilImage;
            if (profileImageFile) updatedImagePath = await uploadDuenoProfileImage();
            const response = await fetch(`${API_BASE_URL}/duenos/${user.idUsuario}`, {
                method: 'PUT', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(perfilForm)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            updateUser({ ...user, ...perfilForm, perfilImage: updatedImagePath });
            alert('Perfil actualizado exitosamente!');
            setEditingPerfil(false);
            setProfileImageFile(null);
        } catch (err) {
            setError('Error al actualizar perfil: ' + err.message);
            alert('Error al actualizar perfil: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteMascota = async (mascotaId) => {
        if (!mascotaId) { alert('Error: No se pudo identificar la mascota'); return; }
        if (!window.confirm('¿Estás seguro de eliminar esta mascota?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/mascotas/${mascotaId}`, {
                method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            setMascotas(prev => prev.filter(m => (m.id !== mascotaId) && (m.idMascota !== mascotaId)));
            alert('Mascota eliminada exitosamente');
        } catch (err) {
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
        setMascotaImageFile(null);
        setCurrentView('nueva-mascota');
    };

    const handleMascotaChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMascotaForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleLogout = async () => {
        try { await logout(); alert('Sesión cerrada'); }
        catch (err) { console.error('Error al cerrar sesión:', err); }
    };

    // ─── renderReservas: NO hooks inside, uses filterStatus from component scope ─

    const renderReservas = () => {
        const reservasFiltradas = getReservasByEstado(filterStatus);

        const handleCancelarReserva = async (reservaId) => {
            if (!window.confirm('¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.')) return;
            const result = await cancelarReserva(reservaId);
            if (result.success) alert('✅ Reserva cancelada exitosamente');
            else alert('❌ Error al cancelar: ' + result.error);
        };

        return (
            <div className="dashboard-main">
                <div className="reservas-header">
                    <h2 className="section-title">Mis Reservas</h2>

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
                            Pendientes ({getReservasByEstado('pendiente').length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('en_curso')}
                            className={`filter-btn ${filterStatus === 'en_curso' ? 'active' : ''}`}
                        >
                            En curso ({getReservasByEstado('en_curso').length})
                        </button>
                    </div>
                </div>

                {reservasLoading && <div className="loading-message">Cargando reservas...</div>}
                {reservasError && <div className="error-message">{reservasError}</div>}

                {reservasFiltradas.length === 0 && !reservasLoading ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                        <h3>
                            {filterStatus === 'todas' && 'No tenés reservas todavía'}
                            {filterStatus === 'pendiente' && 'No tenés reservas pendientes'}
                            {filterStatus === 'en_curso' && 'No tenés reservas en curso'}
                        </h3>
                        <p>Explorá las publicaciones disponibles y hacé tu primera reserva</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-primary"
                            style={{ marginTop: '16px' }}
                        >
                            Ver Publicaciones
                        </button>
                    </div>
                ) : (
                    <div className="reservas-grid">
                        {reservasFiltradas.map((reserva) => (
                            <ReservaCard
                                key={reserva.idReserva || reserva.id}
                                reserva={reserva}
                                userType="dueno"
                                onCancelar={handleCancelarReserva}
                            // isExpired y onAceptar/onRechazar eliminados:
                            // el estado lo calcula la card desde reserva.estadoCalculado
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };


    const renderMascotas = () => (
        // Usamos un fragmento para que no haya wrapper extra
        <>
            {/* CABECERA: fuera del contenedor de cards */}
            <div className="mascotas-header">
                <h2 className="section-title">Mis Mascotas</h2>
                <button
                    onClick={() => {
                        setEditingMascota(null);
                        setMascotaImageFile(null);
                        setCurrentView('nueva-mascota');
                    }}
                    className="btn-primary"
                >
                    + Agregar Mascota
                </button>
            </div>

            {/* GRID: ocupa toda la pantalla */}
            <div className="mascotas-grid-wrapper">
                {loading && <div className="loading-message">Cargando mascotas...</div>}
                {error && <div className="error-message">{error}</div>}

                {!Array.isArray(mascotas) ? (
                    <div className="error-message">Error: Datos de mascotas inválidos.</div>
                ) : mascotas.length === 0 && !loading ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '64px', marginBottom: '12px' }}>🐾</div>
                        <h3>Todavía no tenés mascotas registradas</h3>
                        <p style={{ marginBottom: '20px', color: 'var(--text-gray)' }}>
                            Agregá tu primera mascota para empezar
                        </p>
                        <button
                            onClick={() => {
                                setEditingMascota(null);
                                setMascotaImageFile(null);
                                setCurrentView('nueva-mascota');
                            }}
                            className="btn-primary"
                        >
                            + Agregar Mascota
                        </button>
                    </div>
                ) : (
                    <div className="mascotas-grid">
                        {mascotas.map((mascota) => (
                            <div key={mascota.id || mascota.idMascota} className="mascota-card">

                                {/* ── Imagen ── */}
                                <div className="mascota-image-section-horizontal">
                                    {mascota.imagen?.path || mascota.fotoPerfil ? (
                                        <img
                                            src={mascota.imagen?.path || mascota.fotoPerfil}
                                            alt={`Foto de ${mascota.nomMascota || mascota.nombre}`}
                                            className="mascota-image"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="mascota-no-image">
                                            {mascota.exotico ? '🦎' : '🐕'}
                                        </div>
                                    )}

                                    {/* Botón cambiar foto flotante sobre la imagen */}
                                    <div className="image-upload-section">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(mascota.id || mascota.idMascota, e)}
                                            className="file-input-hidden"
                                            id={`file-input-${mascota.id || mascota.idMascota}`}
                                            disabled={imageUploading}
                                            style={{ display: 'none' }}
                                        />
                                        <label
                                            htmlFor={`file-input-${mascota.id || mascota.idMascota}`}
                                            className="btn-upload-image"
                                        >
                                            {imageUploading ? '📤 Subiendo...' : '📷 Cambiar foto'}
                                        </label>
                                    </div>
                                </div>

                                {/* ── Info ── */}
                                <div className="mascota-details-section">
                                    <div className="mascota-header">
                                        <h3 className="mascota-name">
                                            {mascota.nomMascota || mascota.nombre || 'Sin nombre'}
                                        </h3>
                                    </div>

                                    <div className="mascota-details">
                                        <p><strong>Especie:</strong> {mascota.especie?.nomEspecie || mascota.especie?.nombre || 'N/A'}</p>
                                        <p><strong>Raza:</strong>   {mascota.raza?.nomRaza || mascota.raza?.nombre || 'N/A'}</p>
                                        <p><strong>Edad:</strong>   {mascota.edad} años</p>
                                        <p><strong>Sexo:</strong>   {mascota.sexo === 'M' ? 'Macho' : mascota.sexo === 'F' ? 'Hembra' : mascota.sexo}</p>
                                        <p><strong>Peso:</strong>   {mascota.peso} kg</p>
                                    </div>

                                    {mascota.exotico && (
                                        <span className="exotic-badge">Exótica</span>
                                    )}

                                    {mascota.descripcion && (
                                        <p className="mascota-description">{mascota.descripcion}</p>
                                    )}
                                </div>

                                {/* ── Acciones ── */}
                                <div className="mascota-actions">
                                    <button onClick={() => startEditMascota(mascota)} className="btn-edit">
                                        ✏️ Editar
                                    </button>
                                    <button onClick={() => deleteMascota(mascota.id || mascota.idMascota)} className="btn-delete">
                                        🗑️ Eliminar
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );




    const renderNuevaMascota = () => (
        <div className="form-container">

            {/* Título fuera de la card */}
            <h2 className="section-title">
                {editingMascota ? 'Editar Mascota' : 'Agregar Nueva Mascota'}
            </h2>

            {/* Card blanca del formulario */}
            <form onSubmit={handleMascotaSubmit} className="form-card">

                {/* ── Preview de imagen ── */}
                <div className="form-group" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <label className="form-label">Foto de la mascota:</label>
                    <div style={{ margin: '1rem 0' }}>
                        {mascotaImageFile ? (
                            <img
                                src={URL.createObjectURL(mascotaImageFile)}
                                alt="Preview"
                                style={{
                                    width: '280px', height: '240px',
                                    borderRadius: '16px', objectFit: 'contain',
                                    backgroundColor: '#f8f8f8', border: '2px solid #e5e7eb',
                                    display: 'block', margin: '0 auto'
                                }}
                            />
                        ) : editingMascota?.imagen?.path || editingMascota?.fotoPerfil ? (
                            <img
                                src={editingMascota.imagen?.path || editingMascota.fotoPerfil}
                                alt="Foto actual"
                                style={{
                                    width: '280px', height: '240px',
                                    borderRadius: '16px', objectFit: 'contain',
                                    backgroundColor: '#f8f8f8', border: '2px solid #e5e7eb',
                                    display: 'block', margin: '0 auto'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '280px', height: '240px', borderRadius: '16px',
                                backgroundColor: '#fff5f2', border: '2px dashed #ff8f73',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto', fontSize: '5rem', color: '#f97840'
                            }}>
                                🐾
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleMascotaImageChange}
                        className="form-input"
                        style={{ marginTop: '0.75rem', cursor: 'pointer' }}
                    />

                    {(editingMascota?.imagen?.path || editingMascota?.fotoPerfil || mascotaImageFile) && (
                        <button
                            type="button"
                            onClick={deleteMascotaImageFromForm}
                            className="btn-delete"
                            disabled={imageUploading}
                            style={{ marginTop: '0.75rem', width: 'auto', padding: '0.6rem 1.5rem', flex: 'none' }}
                        >
                            {imageUploading ? 'Eliminando...' : '🗑️ Eliminar Foto'}
                        </button>
                    )}
                </div>

                {/* ── Nombre ── */}
                <div className="form-group">
                    <label className="form-label">Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        value={mascotaForm.nombre}
                        onChange={handleMascotaChange}
                        required
                        className="form-input"
                        placeholder="Ej: Panchito"
                    />
                </div>

                {/* ── Especie / Raza ── */}
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
                                <option key={especie.id} value={especie.id}>{especie.nombre}</option>
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
                                    ? 'Primero seleccioná una especie...'
                                    : razasFiltradas.length === 0
                                        ? 'No hay razas disponibles'
                                        : 'Seleccionar raza...'}
                            </option>
                            {razasFiltradas.map((raza) => (
                                <option key={raza.id} value={raza.id}>{raza.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Edad / Sexo ── */}
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
                            placeholder="Ej: 3"
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
                            <option value="M">Macho</option>
                            <option value="F">Hembra</option>
                        </select>
                    </div>
                </div>

                {/* ── Peso ── */}
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
                        placeholder="Ej: 6.5"
                    />
                </div>

                {/* ── Descripción ── */}
                <div className="form-group">
                    <label className="form-label">Descripción (opcional):</label>
                    <textarea
                        name="descripcion"
                        value={mascotaForm.descripcion}
                        onChange={handleMascotaChange}
                        rows={4}
                        className="form-textarea"
                        placeholder="Características especiales, comportamiento, gustos..."
                    />
                </div>

                {/* ── Exótico ── */}
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

                {error && <div className="error-message">{error}</div>}

                {/* ── Botones ── */}
                <div className="form-buttons">
                    <button
                        type="button"
                        onClick={() => {
                            setCurrentView('mascotas');
                            setEditingMascota(null);
                            setMascotaImageFile(null);
                            setMascotaForm({ nombre: '', edad: '', sexo: '', exotico: false, descripcion: '', peso: '', idEspecie: '', idRaza: '' });
                        }}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || imageUploading}
                        className="btn-primary"
                    >
                        {loading || imageUploading
                            ? 'Guardando...'
                            : editingMascota ? '✅ Actualizar Mascota' : '+ Agregar Mascota'}
                    </button>
                </div>

            </form>
        </div>
    );

    const renderPerfil = () => (
        <div className="dashboard-main">
            <div className="perfil-container">
                <h2 className="section-title">Mi Perfil</h2>

                {!editingPerfil ? (
                    <div className="perfil-card">
                        {/* ── Foto ── */}
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

                        {/* ── Campos ── */}
                        <div className="perfil-fields">
                            <div className="perfil-field">
                                <span className="field-label">Nombre</span>
                                <p className="field-value">{user?.nombre}</p>
                            </div>
                            <div className="perfil-field">
                                <span className="field-label">Email</span>
                                <p className="field-value">{user?.email}</p>
                            </div>
                            <div className="perfil-field">
                                <span className="field-label">Teléfono</span>
                                <p className="field-value">{user?.telefono || 'No especificado'}</p>
                            </div>
                            <div className="perfil-field">
                                <span className="field-label">Tel. Emergencia</span>
                                <p className="field-value">{user?.telefonoEmergencia || 'No especificado'}</p>
                            </div>
                            <div className="perfil-field">
                                <span className="field-label">Documento</span>
                                <p className="field-value">
                                    {user?.tipoDocumento || 'DNI'} {user?.nroDocumento || 'No especificado'}
                                </p>
                            </div>
                        </div>


                        <div className="perfil-2fa">
                            <span className="perfil-2fa-label">🔐 Verificación en dos pasos</span>
                            <button
                                type="button"
                                onClick={handleActivate2FA}
                                disabled={loading2FA}
                                className="btn-2fa"
                            >
                                {loading2FA ? 'Generando...' : 'Activar 2FA'}
                            </button>
                        </div>

                        {/* ── Acciones ── */}
                        <div className="perfil-actions">
                            <button
                                onClick={() => { setEditingPerfil(true); setProfileImageFile(null); setError(''); }}
                                className="btn-primary"
                            >
                                ✏️ Editar Perfil
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="btn-danger"
                                disabled={loading}
                            >
                                {loading ? 'Eliminando...' : '🗑️ Eliminar Cuenta'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handlePerfilSubmit} className="perfil-form-card">
                        {/* ── Foto ── */}
                        <div className="perfil-image-upload">
                            <label className="form-label">Foto de perfil:</label>
                            <div className="profile-image-preview">
                                {profileImageFile ? (
                                    <img src={URL.createObjectURL(profileImageFile)} alt="Preview" className="perfil-image" />
                                ) : user?.perfilImage ? (
                                    <img src={`http://localhost:3000${user.perfilImage}`} alt="Foto actual" className="perfil-image" />
                                ) : (
                                    <div className="perfil-placeholder">👤</div>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handleProfileImageChange} />
                            {user?.perfilImage && (
                                <button type="button" onClick={deleteDuenoProfileImage} className="btn-danger" disabled={imageUploading}>
                                    {imageUploading ? 'Eliminando...' : '🗑️ Eliminar Foto'}
                                </button>
                            )}
                        </div>

                        {/* ── Campos ── */}
                        <div className="form-group">
                            <label className="form-label">Nombre:</label>
                            <input type="text" name="nombre" value={perfilForm.nombre}
                                onChange={handlePerfilFormChange} className="form-input" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email:</label>
                            <input type="email" name="email" value={perfilForm.email}
                                onChange={handlePerfilFormChange} className="form-input" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Teléfono:</label>
                            <input type="tel" name="telefono" value={perfilForm.telefono}
                                onChange={handlePerfilFormChange} className="form-input" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Teléfono de emergencia:</label>
                            <input type="tel" name="telefonoEmergencia" value={perfilForm.telefonoEmergencia || ''}
                                onChange={handlePerfilFormChange} className="form-input" />
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Tipo de documento:</label>
                                <select name="tipoDocumento" value={perfilForm.tipoDocumento}
                                    onChange={handlePerfilFormChange} className="form-select">
                                    <option value="DNI">DNI</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nro. documento:</label>
                                <input type="text" name="nroDocumento" value={perfilForm.nroDocumento}
                                    onChange={handlePerfilFormChange} className="form-input" />
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-buttons">
                            <button type="button"
                                onClick={() => { setEditingPerfil(false); setProfileImageFile(null); setError(''); }}
                                className="btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading || imageUploading} className="btn-primary">
                                {loading || imageUploading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
    if (loading && !mascotas.length && currentView === 'mascotas') {
        return <div className="loading-message">Cargando...</div>;
    }

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div id="main-dashboard" className="dashboard-container">
            <nav id="main-navbar" className="dashboard-navbar">
                <div className="navbar-brand">
                    <h1 id="main-title" className="navbar-title">
                        🐈 Petsbnb Dueño
                    </h1>
                </div>

                <div className="navbar-buttons-center">
                    <button onClick={() => navigate('/')} className="nav-button btn-home">
                        <Home size={18} />
                        Ver Publicaciones
                    </button>
                    <button
                        onClick={() => setCurrentView('mascotas')}
                        className={`nav-button ${currentView === 'mascotas' ? 'active' : ''}`}
                    >
                        <PawPrint size={18} />
                        Mascotas
                    </button>
                    <button
                        onClick={() => setCurrentView('reservas')}
                        className={`nav-button ${currentView === 'reservas' ? 'active' : ''}`}
                    >
                        <CalendarCheck size={18} />
                        Reservas
                    </button>
                </div>

                <div className="navbar-buttons-right">
                    <button
                        onClick={() => setCurrentView('perfil')}
                        className={`nav-button ${currentView === 'perfil' ? 'active' : ''}`}
                    >
                        <User size={18} />
                        Perfil
                    </button>
                    <button onClick={handleLogout} className="logout-button">
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            <main className="dashboard-main">
                {currentView === 'mascotas' && renderMascotas()}
                {currentView === 'reservas' && renderReservas()}
                {currentView === 'perfil' && renderPerfil()}
                {currentView === 'nueva-mascota' && renderNuevaMascota()}
            </main>


            {show2FAModal && (
                <div className="twofa-modal-overlay" onClick={close2FAModal}>
                    <div className="twofa-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="twofa-modal-header">
                            <span className="twofa-modal-icon">🔐</span>
                            <h3>Verificación en dos pasos</h3>
                            <button className="twofa-modal-close" onClick={close2FAModal}>✕</button>
                        </div>
                        <p className="twofa-modal-desc">
                            Escaneá este código QR con Google Authenticator o cualquier app TOTP.
                            Una vez configurado, se te pedirá el código al iniciar sesión.
                        </p>
                        <div className="twofa-modal-qr">
                            {loading2FA ? (
                                <div className="twofa-loading">Generando código QR...</div>
                            ) : qrCode2FA ? (
                                <img src={qrCode2FA} alt="Código QR 2FA" />
                            ) : (
                                <div className="twofa-loading" style={{ color: 'var(--error-red)' }}>
                                    Error al cargar el código QR
                                </div>
                            )}
                        </div>
                        <button className="twofa-modal-btn-close" onClick={close2FAModal}>
                            Listo, cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuenoDashboard;