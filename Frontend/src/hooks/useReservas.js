import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

const calcularEstado = (reserva) => {
  // ✅ Si no hay fechas, es pendiente (reservas viejas o mal formadas)
  if (!reserva.fechaDesde || !reserva.fechaHasta) {
    console.warn('⚠️ Reserva sin fechas:', reserva.idReserva);
    return 'pendiente';
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // ✅ Parsear las fechas correctamente
  const desde = new Date(reserva.fechaDesde);
  desde.setHours(0, 0, 0, 0);

  const hasta = new Date(reserva.fechaHasta);
  hasta.setHours(0, 0, 0, 0);

  // ✅ Debug para ver qué está pasando
  console.log('📅 Calculando estado para reserva', reserva.idReserva, {
    hoy: hoy.toISOString().split('T')[0],
    desde: desde.toISOString().split('T')[0],
    hasta: hasta.toISOString().split('T')[0]
  });

  if (hoy < desde) return 'pendiente';
  if (hoy > hasta) return 'finalizada';
  return 'en_curso';
};

export const useReservas = (userId, userType) => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReservas = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/reservas`, { credentials: 'include' });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      console.log('📦 Reservas recibidas del backend:', data.data?.length || 0);

      let filtradas = [];

      if (userType === 'dueno') {
        filtradas = data.data.filter(r =>
          r.dueno?.idUsuario === userId || r.dueno === userId
        );
        console.log(`🐕 Reservas filtradas para dueño ${userId}:`, filtradas.length);
      } else if (userType === 'cuidador') {
        filtradas = data.data.filter(r =>
          r.publicacion?.idCuidador?.idUsuario === userId
        );
        console.log(`👤 Reservas filtradas para cuidador ${userId}:`, filtradas.length);
      }

      // ✅ Agregar estado calculado
      const conEstado = filtradas.map(r => {
        const estado = calcularEstado(r);
        console.log(`📌 Reserva ${r.idReserva} → ${estado}`);
        return { ...r, estadoCalculado: estado };
      });

      // ✅ NO FILTRAR las finalizadas aquí - dejar que las tabs lo hagan
      // Esto permite que veas TODAS tus reservas en la tab "Todas"
      setReservas(conEstado);

      console.log('✅ Reservas cargadas:', {
        total: conEstado.length,
        pendientes: conEstado.filter(r => r.estadoCalculado === 'pendiente').length,
        enCurso: conEstado.filter(r => r.estadoCalculado === 'en_curso').length,
        finalizadas: conEstado.filter(r => r.estadoCalculado === 'finalizada').length
      });

    } catch (err) {
      console.error('❌ Error cargando reservas:', err);
      setError('Error al cargar reservas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  const cancelarReserva = async (reservaId) => {
    try {
      console.log('🗑️ Cancelando reserva:', reservaId);
      const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      // Remover del estado local
      setReservas(prev =>
        prev.filter(r => r.idReserva !== reservaId && r.id !== reservaId)
      );
      console.log('✅ Reserva cancelada');
      return { success: true };
    } catch (err) {
      console.error('❌ Error cancelando reserva:', err);
      return { success: false, error: err.message };
    }
  };

  // ✅ Filtrar por estado para las tabs
  const getReservasByEstado = useCallback((estado) => {
    console.log(`🔍 Filtrando por estado: ${estado}`);
    if (estado === 'todas') return reservas;
    const filtradas = reservas.filter(r => r.estadoCalculado === estado);
    console.log(`   → ${filtradas.length} reservas encontradas`);
    return filtradas;
  }, [reservas]);

  useEffect(() => {
    if (userId) {
      console.log('🔄 useEffect ejecutado - cargando reservas');
      fetchReservas();
      const interval = setInterval(fetchReservas, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [userId, fetchReservas]);

  return {
    reservas,
    loading,
    error,
    fetchReservas,
    cancelarReserva,
    getReservasByEstado,
  };
};
