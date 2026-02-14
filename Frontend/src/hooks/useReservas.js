import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Hook personalizado para manejar reservas
 * Filtra automáticamente reservas pasadas y actualiza estados
 */
export const useReservas = (userId, userType) => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Determina si una reserva ha expirado
   */
  const isReservaExpired = useCallback((reserva) => {
    if (!reserva.fechaHasta) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fechaHasta = new Date(reserva.fechaHasta);
    fechaHasta.setHours(0, 0, 0, 0);
    return fechaHasta < today;
  }, []);

  /**
   * Obtiene el estado real de una reserva
   */
  const getReservaEstado = useCallback((reserva) => {
    if (isReservaExpired(reserva)) {
      return 'finalizada';
    }
    return reserva.estado || 'pendiente';
  }, [isReservaExpired]);

  /**
   * Fetch reservas desde la API
   */
  const fetchReservas = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/reservas`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let reservasFiltradas = [];

      // Filtrar según tipo de usuario
      if (userType === 'dueno') {
        reservasFiltradas = data.data.filter(r =>
          r.dueno?.idUsuario === userId || r.dueno === userId
        );
      } else if (userType === 'cuidador') {
        reservasFiltradas = data.data.filter(r =>
          r.publicacion?.idCuidador?.idUsuario === userId
        );
      }

      // Filtrar reservas no expiradas y actualizar estados
      const reservasActivas = reservasFiltradas
        .map(reserva => ({
          ...reserva,
          estado: getReservaEstado(reserva)
        }))
        .filter(reserva => reserva.estado !== 'finalizada' || !isReservaExpired(reserva));

      setReservas(reservasActivas);

    } catch (err) {
      console.error('Error fetching reservas:', err);
      setError('Error al cargar reservas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, userType, getReservaEstado, isReservaExpired]);

  /**
   * Actualiza el estado de una reserva
   */
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

      // Actualizar estado local
      setReservas(prev => prev.map(reserva =>
        reserva.id === reservaId
          ? { ...reserva, estado: nuevoEstado }
          : reserva
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Cancela una reserva
   */
  const cancelarReserva = async (reservaId) => {
    const result = await updateReservaEstado(reservaId, 'cancelada');
    return result;
  };

  /**
   * Acepta una reserva (solo cuidadores)
   */
  const aceptarReserva = async (reservaId) => {
    const result = await updateReservaEstado(reservaId, 'confirmada');
    return result;
  };

  /**
   * Rechaza una reserva (solo cuidadores)
   */
  const rechazarReserva = async (reservaId) => {
    const result = await updateReservaEstado(reservaId, 'rechazada');
    return result;
  };

  /**
   * Filtra reservas por estado
   */
  const getReservasByEstado = useCallback((estado) => {
    if (estado === 'todas') return reservas;
    return reservas.filter(r => (r.estado || 'pendiente') === estado);
  }, [reservas]);

  /**
   * Auto-refresh cada 5 minutos
   */
  useEffect(() => {
    if (userId) {
      fetchReservas();

      const interval = setInterval(() => {
        fetchReservas();
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(interval);
    }
  }, [userId, fetchReservas]);

  return {
    reservas,
    loading,
    error,
    fetchReservas,
    cancelarReserva,
    aceptarReserva,
    rechazarReserva,
    getReservasByEstado,
    isReservaExpired,
    getReservaEstado
  };
};