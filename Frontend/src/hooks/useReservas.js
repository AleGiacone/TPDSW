import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

const calcularEstado = (reserva) => {
  if (!reserva.fechaDesde || !reserva.fechaHasta) return 'pendiente';

 
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const desdeStr = reserva.fechaDesde.split('T')[0];
  const [dy, dm, dd] = desdeStr.split('-').map(Number);
  const desde = new Date(dy, dm - 1, dd);

  const hastaStr = reserva.fechaHasta.split('T')[0];
  const [hy, hm, hd] = hastaStr.split('-').map(Number);
  const hasta = new Date(hy, hm - 1, hd);

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
    

      let filtradas = [];

      if (userType === 'dueno') {
        filtradas = data.data.filter(r =>
          r.dueno?.idUsuario === userId || r.dueno === userId
        );
      } else if (userType === 'cuidador') {
        filtradas = data.data.filter(r =>
          r.publicacion?.idCuidador?.idUsuario === userId
        );
        console.log(`👤 Reservas filtradas para cuidador ${userId}:`, filtradas.length);
      }

      //  estado calculado
      const conEstado = filtradas.map(r => {
        const estado = calcularEstado(r);
        return { ...r, estadoCalculado: estado };
      });

      // 
      //"Todas"
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

  //  Filtrar por estado para las tabs
  const getReservasByEstado = useCallback((estado) => {
    if (estado === 'todas') return reservas;
    const filtradas = reservas.filter(r => r.estadoCalculado === estado);
    console.log(`   → ${filtradas.length} reservas encontradas`);
    return filtradas;
  }, [reservas]);

  useEffect(() => {
    if (userId) {
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
