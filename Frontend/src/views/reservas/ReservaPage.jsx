import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, X, AlertCircle, Check, PawPrint, Plus } from 'lucide-react';
import PublicacionCard from '../../components/PublicacionCard';
import '../../styles/ReservaPage.css';
const API_BASE_URL = 'http://localhost:3000/api';

// Componente de Calendario
const DateRangePicker = ({ onDateChange, disabledDates = [], publicacionId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

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

  const isDateDisabled = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today || disabledDates.includes(dateStr);
  };

  const isDateInRange = (date) => {
    if (!selectedStart || !selectedEnd) return false;
    return date >= selectedStart && date <= selectedEnd;
  };

  const isDateInHoverRange = (date) => {
    if (!selectedStart || selectedEnd || !hoveredDate) return false;
    const start = selectedStart < hoveredDate ? selectedStart : hoveredDate;
    const end = selectedStart < hoveredDate ? hoveredDate : selectedStart;
    return date >= start && date <= end;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (!selectedStart || selectedEnd) {
      setSelectedStart(date);
      setSelectedEnd(null);
      onDateChange(date, null);
    } else {
      if (date < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
        onDateChange(date, selectedStart);
      } else {
        setSelectedEnd(date);
        onDateChange(selectedStart, date);
      }
    }
  };

  const renderCalendar = (monthOffset = 0) => {
    const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(displayMonth);
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const isStart = selectedStart && date.toDateString() === selectedStart.toDateString();
      const isEnd = selectedEnd && date.toDateString() === selectedEnd.toDateString();
      const inRange = isDateInRange(date);
      const inHoverRange = isDateInHoverRange(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => setHoveredDate(date)}
          className={`calendar-day ${disabled ? 'disabled' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''} ${inRange ? 'in-range' : ''} ${inHoverRange ? 'hover-range' : ''}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="date-picker-container">
      <div className="calendar-navigation">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
          ←
        </button>
        <span>{months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
          →
        </button>
      </div>

      <div className="calendars-wrapper">
        <div className="calendar-grid">
          <div className="calendar-header">
            <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div>
            <div>Jue</div><div>Vie</div><div>Sáb</div>
          </div>
          <div className="calendar-days">
            {renderCalendar(0)}
          </div>
        </div>

        <div className="calendar-grid">
          <div className="calendar-header">
            <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div>
            <div>Jue</div><div>Vie</div><div>Sáb</div>
          </div>
          <div className="calendar-days">
            {renderCalendar(1)}
          </div>
        </div>
      </div>

      <div className="calendar-info">
        <AlertCircle size={16} />
        <span>Las fechas en gris no están disponibles</span>
      </div>
    </div>
  );
};

// Componente Principal de Reserva
const ReservaPage = ({ publicacionId: propPublicacionId, userId }) => {
  const [publicacion, setPublicacion] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [diasReservados, setDiasReservados] = useState([]);
  const [selectedMascotas, setSelectedMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (propPublicacionId) {
      fetchPublicacion();
      fetchDiasReservados();
    }
    if (userId) {
      fetchMascotas();
    }
  }, [propPublicacionId, userId]);

  const fetchPublicacion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/publicacion/${propPublicacionId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar publicación');
      const data = await response.json();
      setPublicacion(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiasReservados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/publicacion/dias-reservados/${propPublicacionId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar fechas');
      const data = await response.json();
      setDiasReservados(data.data || []);
    } catch (err) {
      console.error('Error fetching reserved days:', err);
    }
  };

  const fetchMascotas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mascotas/duenos/${userId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar mascotas');
      const data = await response.json();
      setMascotas(data.data || data.mascotas || []);
    } catch (err) {
      console.error('Error fetching mascotas:', err);
    }
  };

  const handleDateChange = (start, end) => {
    setFechaInicio(start);
    setFechaFin(end);
  };

  const toggleMascota = (mascotaId) => {
    setSelectedMascotas(prev =>
      prev.includes(mascotaId)
        ? prev.filter(id => id !== mascotaId)
        : [...prev, mascotaId]
    );
  };

  const calculateDias = () => {
    if (!fechaInicio || !fechaFin) return [];

    const dias = [];
    const current = new Date(fechaInicio);
    const end = new Date(fechaFin);

    while (current <= end) {
      dias.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dias;
  };

  const calculateNights = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const diffTime = Math.abs(fechaFin - fechaInicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * (publicacion?.tarifaPorDia || 0);
  };

  const handleSubmit = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona las fechas');
      return;
    }

    if (selectedMascotas.length === 0) {
      alert('Por favor selecciona al menos una mascota');
      return;
    }

    setSubmitting(true);
    try {
      const dias = calculateDias();

      const reservaData = {
        fechaReserva: new Date().toISOString(),
        descripcion: descripcion || 'Reserva de cuidado',
        idDueno: userId,
        idMascotas: selectedMascotas,
        idPublicacion: propPublicacionId,
        dias: dias,
        fechaDesde: fechaInicio.toISOString(),
        fechaHasta: fechaFin.toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/reservas/test-pago`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      });
      const { session } = await response.json();

      // Redirigir al usuario a la página de pago de Stripe
      window.location.href = session.url;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear reserva');
      }

      alert('¡Reserva creada exitosamente!');
      // Reset form
      setFechaInicio(null);
      setFechaFin(null);
      setSelectedMascotas([]);
      setDescripcion('');
      setShowCalendar(false);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!publicacion) return <div className="error">Publicación no encontrada</div>;

  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <div className="reserva-container">
      {/* Card de la publicación */}
      <div className="reserva-publicacion-section">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Publicación seleccionada</h2>
        <PublicacionCard
          publicacion={publicacion}
          showActions={false}
          showCuidadorInfo={true}
        />
      </div>

      {/* Card de reserva */}
      <div className="reserva-card">
        <div className="price-header">
          <div className="price">
            ${publicacion.tarifaPorDia} <span>por noche</span>
          </div>
          <div className="rating">
            ⭐ 4.88 · 72 evaluaciones
          </div>
        </div>

        <div className="date-inputs" onClick={() => setShowCalendar(true)}>
          <div className="date-input-row">
            <div className="date-input">
              <div className="date-label">CHECK-IN</div>
              <div className="date-value">
                {fechaInicio ? fechaInicio.toLocaleDateString('es-AR') : 'Seleccionar fecha'}
              </div>
            </div>
            <div className="date-input">
              <div className="date-label">CHECKOUT</div>
              <div className="date-value">
                {fechaFin ? fechaFin.toLocaleDateString('es-AR') : 'Seleccionar fecha'}
              </div>
            </div>
          </div>
        </div>

        {mascotas.length === 0 ? (
          <div className="no-mascotas">
            <PawPrint size={48} style={{ margin: '0 auto 16px', color: '#ddd' }} />
            <p>No tienes mascotas registradas</p>
            <button className="add-mascota-button" onClick={() => window.location.href = '/dashboard'}>
              <Plus size={20} />
              Agregar Mascota
            </button>
          </div>
        ) : (
          <div className="mascotas-section">
            <div className="section-title">Selecciona tus mascotas</div>
            <div className="mascotas-list">
              {mascotas.map(mascota => {
                const mascotaId = mascota.idMascota || mascota.id;
                const imagenUrl = mascota.imagen?.path || mascota.fotoPerfil;

                return (
                  <div
                    key={mascotaId}
                    className={`mascota-item ${selectedMascotas.includes(mascotaId) ? 'selected' : ''}`}
                    onClick={() => toggleMascota(mascotaId)}
                  >
                    <input
                      type="checkbox"
                      className="mascota-checkbox"
                      checked={selectedMascotas.includes(mascotaId)}
                      onChange={() => { }}
                    />

                    {/* Imagen de la mascota */}
                    <div className="mascota-image-thumb">
                      {imagenUrl ? (
                        <img
                          src={imagenUrl}
                          alt={mascota.nomMascota || mascota.nombre}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="mascota-image-placeholder" style={{ display: imagenUrl ? 'none' : 'flex' }}>
                        {mascota.exotico ? '🦎' : '🐕'}
                      </div>
                    </div>

                    <div className="mascota-info">
                      <div className="mascota-name">
                        {mascota.nomMascota || mascota.nombre}
                      </div>
                      <div className="mascota-details">
                        {mascota.especie?.nomEspecie || mascota.especie?.nombre} · {mascota.edad} años
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="notes-section">
          <div className="section-title">Notas adicionales (opcional)</div>
          <textarea
            className="notes-textarea"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Información especial sobre tu mascota que el cuidador debería saber..."
          />
        </div>

        <button
          className="reserve-button"
          onClick={handleSubmit}
          disabled={!fechaInicio || !fechaFin || selectedMascotas.length === 0 || submitting}
        >
          {submitting ? 'Procesando...' : 'Reservar'}
        </button>

        {nights > 0 && (
          <div className="price-breakdown">
            <div className="price-row">
              <span>${publicacion.tarifaPorDia} x {nights} noches</span>
              <span>${publicacion.tarifaPorDia * nights}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        )}

      </div>

      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Selecciona las fechas</h2>
              <button className="close-button" onClick={() => setShowCalendar(false)}>
                <X size={24} />
              </button>
            </div>
            <DateRangePicker
              onDateChange={handleDateChange}
              disabledDates={diasReservados}
              publicacionId={propPublicacionId}
            />
            <button
              className="reserve-button"
              onClick={() => setShowCalendar(false)}
              style={{ marginTop: '24px' }}
            >
              Confirmar fechas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper para usar con React Router
const ReservaPageWrapper = () => {
  const { publicacionId } = useParams();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.tipoUsuario?.toLowerCase() !== 'dueno') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Acceso Restringido</h2>
        <p>Solo los dueños pueden hacer reservas</p>
      </div>
    );
  }

  return (
    <ReservaPage
      publicacionId={parseInt(publicacionId)}
      userId={user.idUsuario}
    />
  );
};

export { ReservaPage, ReservaPageWrapper };
export default ReservaPageWrapper;