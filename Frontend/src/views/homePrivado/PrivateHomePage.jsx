import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ImageCarousel from '../../components/ImageCarousel'; 
import '../../styles/PrivateHomePage.css';


const PublicacionesView = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    

    const [publicaciones, setPublicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    

    const [filtros, setFiltros] = useState({
        ubicacion: '',
        tipoAlojamiento: '',
        tarifaMax: '',
        exotico: false,
        cantAnimales: ''
    });

    const API_BASE_URL = 'http://localhost:3000/api';


    const fetchPublicaciones = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            
            const params = new URLSearchParams();
            if (filtros.ubicacion) params.append('ubicacion', filtros.ubicacion);
            if (filtros.tipoAlojamiento) params.append('tipoAlojamiento', filtros.tipoAlojamiento);
            if (filtros.tarifaMax && !isNaN(parseFloat(filtros.tarifaMax))) params.append('tarifaMax', filtros.tarifaMax);
            if (filtros.exotico) params.append('exotico', filtros.exotico);
            if (filtros.cantAnimales && !isNaN(parseInt(filtros.cantAnimales))) params.append('cantAnimales', filtros.cantAnimales);

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
    }, [filtros]); 


    useEffect(() => {
        fetchPublicaciones();
    }, [fetchPublicaciones]); 

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFiltros(prev => ({
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="search-container">
                <div className="search-filters">
                    

                    <div className="filter-group">
                        <label className="filter-label">Lugar</label>
                        <input
                            type="text"
                            placeholder="Explorar destinos"
                            className="filter-input-field"
                            name="ubicacion"
                            value={filtros.ubicacion}
                            onChange={handleFilterChange}
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label className="filter-label">Tipo de alojamiento</label>
                        <select
                            name="tipoAlojamiento"
                            value={filtros.tipoAlojamiento}
                            onChange={handleFilterChange}
                            className="filter-select-field"
                        >
                            <option value="">Seleccionar</option>
                            <option value="casa">En mi casa</option>
                            <option value="domicilio">En casa del cuidador</option>
                            <option value="ambos">Ambos</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">💰 Tarifa máxima</label>
                        <input
                            type="number"
                            placeholder="Precio máximo"
                            name="tarifaMax"
                            className="filter-input-field"
                            value={filtros.tarifaMax}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">🐕 Cantidad animales</label>
                        <input
                            type="number"
                            placeholder="¿Cuántos?"
                            name="cantAnimales"
                            className="filter-input-field"
                            value={filtros.cantAnimales}
                            onChange={handleFilterChange}
                        />
                    </div>


                    <div className="filter-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="exotico"
                                checked={filtros.exotico}
                                onChange={handleFilterChange}
                                className="checkbox-input"
                            />
                            <span className="checkbox-text">🦎 Exóticos</span>
                        </label>
                    </div>
                   
 
        <button className="search-btn" onClick={fetchPublicaciones}>
            🔍
        </button>
                </div>
            </div>
            
            <main className="homepage-main">
                <div className="hero-section">
                    <h2 className="hero-title">
                        Encontrá el cuidador perfecto para tu mascota
                    </h2>
                </div>
                
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
                
                {!loading && publicaciones.length === 0 ? (
                    <div className="empty-state">
                        <h3>No se encontraron publicaciones</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                ) : (
                    <div className="publicaciones-grid">
                        { Array.isArray(publicaciones) && publicaciones.map((pub) => (
                            <div key={pub.idPublicacion} className="publicacion-card">
                                
                                <div className="card-image-wrapper">
                                    <ImageCarousel 
                                        imagenes={pub.imagenes || []} 
                                        titulo={pub.titulo}
                                    />
                                </div>
                                <div className="card-content">
                                <div className="card-header">
                                    <h3 className="card-title">{pub.titulo}</h3>
                                    <div className="cuidador-info">
                                        <span className="cuidador-name">
                                            Por: {pub.idCuidador?.nombre || 'Cuidador'}
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
                                        ) : user?.tipoUsuario?.toLowerCase() === 'cuidador' ? (
                                            <button 
                                                className="reserve-btn disabled"
                                                title="Los cuidadores no pueden hacer reservas"
                                                disabled
                                            >
                                                Solo para dueños
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleReservar(pub.idPublicacion)}
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

export default PublicacionesView;