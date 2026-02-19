import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PublicacionesGrid from '../../components/PublicacionesGrid';
import '../../styles/PrivateHomePage.css';
import { Calendar, X, AlertCircle, Upload, Trash2, Home, CalendarCheck, User, LogOut, Cat, Dog, DollarSign, MapPin } from 'lucide-react';


const PublicacionesView = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');


    const [formValues, setFormValues] = useState({
        ubicacion: '',
        tipoAlojamiento: '',
        tarifaMax: '',
        exotico: false,
        cantAnimales: ''
    });
    const [filterParams, setFilterParams] = useState(formValues);
    const API_BASE_URL = 'http://localhost:3000/api';
    const [publicaciones, setPublicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

    const fetchPublicaciones = useCallback(async () => {
        setLoading(true);
        setError('');
        try {

            const params = new URLSearchParams();
            if (filterParams.ubicacion) params.append('ubicacion', filterParams.ubicacion);
            if (filterParams.tipoAlojamiento) params.append('tipoAlojamiento', filterParams.tipoAlojamiento);
            if (filterParams.tarifaMax && !isNaN(parseFloat(filterParams.tarifaMax))) params.append('tarifaMax', filterParams.tarifaMax);
            if (filterParams.exotico === true) params.append('exotico', 'true');
            if (filterParams.cantAnimales && !isNaN(parseInt(filterParams.cantAnimales))) {

                params.append('cantAnimales', filterParams.cantAnimales);
            }

            const url = `${API_BASE_URL}/publicacion${params.toString() ? `?${params.toString()}` : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            setPublicaciones(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            setError('Error al cargar publicaciones: ' + err.message);
            setPublicaciones([]);
        } finally {
            setLoading(false);
        }
    }, [filterParams]);


    useEffect(() => {
        fetchPublicaciones();
    }, [fetchPublicaciones]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
      
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

   
    const handleReservar = (publicacionId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user?.tipoUsuario?.toLowerCase() === 'cuidador') {
            alert('Los cuidadores no pueden hacer reservas');
            return;
        }
      
        navigate(`/reservar/${publicacionId}`);
    };


    const renderActionButtons = (pub) => {
        
        const pubId = pub.idPublicacion || pub.id;

        if (!isAuthenticated) {
            return (
                <button
                    onClick={() => navigate('/login')}
                    className="reserve-btn"
                >
                    Iniciar sesión para reservar
                </button>
            );
        }

        if (user?.tipoUsuario?.toLowerCase() === 'cuidador') {
            return (
                <button
                    className="reserve-btn disabled"
                    title="Los cuidadores no pueden hacer reservas"
                    disabled
                >
                    Solo para dueños
                </button>
            );
        }

        return (
            <button
              
                onClick={() => handleReservar(pubId)}
                className="reserve-btn"
            >
                🎯 Reservar
            </button>
        );
    };


    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearch = () => {
        setFilterParams(formValues);
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="search-container">

                <div className="search-filters ">
                    <div className="filter-group">
                        <label className="filter-label"><MapPin size={18} /> Lugar</label>
                        <input
                            type="text"
                            placeholder="Explorar destinos"
                            className="filter-input-field"
                            name="ubicacion"
                            value={formValues.ubicacion}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label"> <Home size={18} /> Tipo de alojamiento</label>
                        <select
                            name="tipoAlojamiento"
                            value={formValues.tipoAlojamiento}
                            onChange={handleInputChange}
                            className="filter-select-field"
                        >
                            <option value="">Seleccionar</option>
                            <option value="casa">En mi casa</option>
                            <option value="domicilio">En casa del cuidador</option>
                            <option value="ambos">Ambos</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label"><DollarSign size={18} /> Tarifa máxima</label>
                        <input
                            type="number"
                            placeholder="Precio máximo"
                            name="tarifaMax"
                            className="filter-input-field"
                            value={formValues.tarifaMax}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label"><Dog size={18} /> Cantidad animales</label>
                        <input
                            type="number"
                            placeholder="¿Cuántos?"
                            name="cantAnimales"
                            className="filter-input-field"
                            value={formValues.cantAnimales}
                            onChange={handleInputChange}
                        />
                    </div>


                    <div className="filter-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="exotico"
                                checked={formValues.exotico}
                                onChange={handleInputChange}
                                className="checkbox-input"
                            />
                            <span className="checkbox-text">Exóticos</span>
                        </label>
                    </div>


                    <button className="search-btn" onClick={handleSearch}>
                        🔍
                    </button>
                </div>
            </div>

            <main className="homepage-main">
                <div className="hero-section">
                    <h2 className="hero-title hide-on-mobile">
                        Encontrá el cuidador perfecto para tu mascota
                    </h2>
                </div>
                <PublicacionesGrid
                    publicaciones={publicaciones}
                    loading={loading}
                    error={error}
                    onRetry={fetchPublicaciones}
                    renderCardActions={renderActionButtons}
                    emptyMessage="No se encontraron publicaciones"
                    showCuidadorInfo={true}
                />
            </main>
        </div>
    );
};

export default PublicacionesView;