import React, { useState } from 'react';
import '../styles/ReservaCard.css';

const ReservaCard = ({
  reserva,
  userType,
  onCancelar,
  onAceptar,
  onRechazar,
  isExpired
}) => {
  const [expanded, setExpanded] = useState(false);

  const reservaId = reserva.id || reserva.idReserva;
  const publicacion = reserva.publicacion;
  const dueno = reserva.dueno;
  const cuidador = publicacion?.idCuidador || publicacion?.cuidador;
  const primeraImagen = publicacion?.imagenes?.[0];

  const estado = reserva.estado || 'pendiente';

  // Calcular días de estancia
  const calcularDias = () => {
    if (!reserva.fechaDesde || !reserva.fechaHasta) return 0;
    const inicio = new Date(reserva.fechaDesde);
    const fin = new Date(reserva.fechaHasta);
    const diffTime = Math.abs(fin - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const dias = calcularDias();

  // Calcular total
  const calcularTotal = () => {
    if (reserva.total) return reserva.total;
    if (publicacion?.tarifaPorDia && dias > 0) {
      return publicacion.tarifaPorDia * dias;
    }
    return 0;
  };

  const total = calcularTotal();

  // Determinar clase de estado
  const getEstadoClass = () => {
    if (isExpired) return 'finalizada';
    switch (estado) {
      case 'confirmada': return 'confirmada';
      case 'cancelada': return 'cancelada';
      case 'rechazada': return 'rechazada';
      default: return 'pendiente';
    }
  };

  // Determinar texto de estado
  const getEstadoTexto = () => {
    if (isExpired) return 'FINALIZADA';
    return (estado || 'PENDIENTE').toUpperCase();
  };

  return (
    <div className={`reserva-card-modern ${getEstadoClass()}`}>
      {/* Header con imagen */}
      <div className="reserva-header-modern">
        <div className="reserva-imagen-container">
          {primeraImagen ? (
            <img
              src={primeraImagen.url || `http://localhost:3000${primeraImagen.path}`}
              alt={publicacion?.titulo || 'Publicación'}
              className="reserva-imagen"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="reserva-placeholder" style={{ display: primeraImagen ? 'none' : 'flex' }}>
            🏠
          </div>
        </div>

        <div className="reserva-info-principal">
          <h3 className="reserva-titulo">{publicacion?.titulo || 'Sin título'}</h3>

          {userType === 'dueno' ? (
            <div className="contacto-info">
              <p className="contacto-nombre">
                <strong>Cuidador:</strong> {cuidador?.nombre || 'N/A'}
              </p>
              {cuidador?.email && (
                <p className="contacto-detalle">📧 {cuidador.email}</p>
              )}
              {cuidador?.telefono && (
                <p className="contacto-detalle">📱 {cuidador.telefono}</p>
              )}
            </div>
          ) : (
            <div className="contacto-info">
              <p className="contacto-nombre">
                <strong>Dueño:</strong> {dueno?.nombre || 'N/A'}
              </p>
              {dueno?.email && (
                <p className="contacto-detalle">📧 {dueno.email}</p>
              )}
              {dueno?.telefono && (
                <p className="contacto-detalle">📱 {dueno.telefono}</p>
              )}
            </div>
          )}

          <span className={`estado-badge estado-${getEstadoClass()}`}>
            {getEstadoTexto()}
          </span>
        </div>
      </div>

      {/* Información de fechas */}
      <div className="reserva-fechas">
        <div className="fecha-item">
          <span className="fecha-label">Check-in</span>
          <span className="fecha-valor">
            {reserva.fechaDesde
              ? new Date(reserva.fechaDesde).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
              : 'N/A'
            }
          </span>
        </div>
        <div className="fecha-separador">→</div>
        <div className="fecha-item">
          <span className="fecha-label">Check-out</span>
          <span className="fecha-valor">
            {reserva.fechaHasta
              ? new Date(reserva.fechaHasta).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
              : 'N/A'
            }
          </span>
        </div>
      </div>

      {/* Resumen de costo */}
      <div className="reserva-costo">
        <div className="costo-detalle">
          <span>Tarifa: ${publicacion?.tarifaPorDia || 0} × {dias} {dias === 1 ? 'día' : 'días'}</span>
        </div>
        <div className="costo-total">
          <span className="total-label">
            {userType === 'cuidador' ? 'Ganancia:' : 'Total:'}
          </span>
          <span className="total-valor">${total}</span>
        </div>
      </div>

      {/* Mascotas preview */}
      <div className="mascotas-preview">
        <strong>Mascotas:</strong>
        <div className="mascotas-lista">
          {reserva.mascotas && reserva.mascotas.length > 0 ? (
            reserva.mascotas.map((mascota, idx) => (
              <div key={idx} className="mascota-chip">
                {mascota.imagen && (
                  <img
                    src={mascota.imagen}
                    alt={mascota.nombre || mascota.nomMascota}
                    className="mascota-avatar"
                  />
                )}
                <span>{mascota.nombre || mascota.nomMascota}</span>
              </div>
            ))
          ) : (
            <span className="no-data">Sin especificar</span>
          )}
        </div>
      </div>

      {/* Botón expandir */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-expandir"
      >
        {expanded ? '▲ Ver menos' : '▼ Ver más detalles'}
      </button>

      {/* Detalles expandidos */}
      {expanded && (
        <div className="detalles-expandidos">
          {reserva.descripcion && (
            <div className="detalle-seccion">
              <h4>Notas</h4>
              <p>{reserva.descripcion}</p>
            </div>
          )}

          <div className="detalle-seccion">
            <h4>Detalles de la Publicación</h4>
            <p><strong>Ubicación:</strong> {publicacion?.ubicacion || 'N/A'}</p>
            <p><strong>Tipo:</strong> {publicacion?.tipoAlojamiento || 'N/A'}</p>
            {publicacion?.exotico && (
              <p className="exotico-tag">✨ Acepta mascotas exóticas</p>
            )}
          </div>

          {reserva.mascotas && reserva.mascotas.length > 0 && (
            <div className="detalle-seccion">
              <h4>Información de Mascotas</h4>
              {reserva.mascotas.map((mascota, idx) => (
                <div key={idx} className="mascota-detalle">
                  <p><strong>{mascota.nombre || mascota.nomMascota}</strong></p>
                  <p>Especie: {mascota.especie}</p>
                  <p>Raza: {mascota.raza}</p>
                  <p>Edad: {mascota.edad} años</p>
                </div>
              ))}
            </div>
          )}

          {reserva.diasReservados && reserva.diasReservados.length > 0 && (
            <div className="detalle-seccion">
              <h4>Días específicos reservados</h4>
              <div className="dias-grid">
                {reserva.diasReservados.map((dia, idx) => (
                  <span key={idx} className="dia-chip">
                    {new Date(dia).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      {!isExpired && (
        <div className="reserva-acciones">
          {userType === 'dueno' && (estado === 'pendiente' || estado === 'confirmada') && (
            <button
              onClick={() => onCancelar(reservaId)}
              className="btn-accion btn-cancelar"
            >
              Cancelar Reserva
            </button>
          )}

          {userType === 'cuidador' && estado === 'pendiente' && (
            <>
              <button
                onClick={() => onRechazar(reservaId)}
                className="btn-accion btn-rechazar"
              >
                ✕ Rechazar
              </button>
              <button
                onClick={() => onAceptar(reservaId)}
                className="btn-accion btn-aceptar"
              >
                ✓ Aceptar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservaCard;