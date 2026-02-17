import React, { useState } from 'react';
import '../styles/ReservaCard.css';

// especie/raza vienen como objeto {idEspecie, nomEspecie} — los convertimos a string
const resolveStr = (val) => {
  if (!val) return 'N/A';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.nomEspecie || val.nomRaza || val.nombre || '';
  return String(val);
};

// Extrae el string "YYYY-MM-DD" de cualquier formato de fecha que venga del backend
// Puede llegar como: "2025-07-15T00:00:00.000Z", "2025-07-15", Date object, etc.
const toDateStr = (val) => {
  if (!val) return null;
  return String(val).split('T')[0]; // siempre queda "YYYY-MM-DD"
};

// Formatea "YYYY-MM-DD" → "15 de julio de 2025" sin desfase UTC
const formatFecha = (dateStr) => {
  if (!dateStr) return 'N/A';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return 'N/A';
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

// Extrae los strings "YYYY-MM-DD" de diasReservados (pueden ser objetos o strings)
const getDiasStrings = (diasReservados = []) =>
  diasReservados
    .map(d => (typeof d === 'string' ? d : d?.fechaReservada ?? ''))
    .filter(Boolean)
    .sort(); // orden ascendente → [0] = min, [last] = max

const ESTADO_CONFIG = {
  pendiente: { label: 'PENDIENTE', badgeClass: 'estado-pendiente', borderClass: 'pendiente' },
  en_curso: { label: 'EN CURSO', badgeClass: 'estado-en_curso', borderClass: 'en_curso' },
};

const ReservaCard = ({ reserva, userType, onCancelar }) => {
  const [expanded, setExpanded] = useState(false);

  const reservaId = reserva.idReserva || reserva.id;
  const publicacion = reserva.publicacion;
  const dueno = reserva.dueno;
  const cuidador = publicacion?.idCuidador || publicacion?.cuidador;
  const primeraImg = publicacion?.imagenes?.[0];

  // ── Fechas ────────────────────────────────────────────────────────────────
  // Estrategia: usar fechaDesde/fechaHasta si existen,
  // si no, derivarlas del min/max de diasReservados (que siempre están)
  const diasStrings = getDiasStrings(reserva.diasReservados);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const estadoCalculado = diasStrings.length > 0 && diasStrings.includes(todayStr) ? 'en_curso' : null;
  const estado = estadoCalculado || reserva.estadoCalculado || 'pendiente';
  const { label, badgeClass, borderClass } = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente;

  const fechaDesdeStr = toDateStr(reserva.fechaDesde) ?? diasStrings[0] ?? null;
  const fechaHastaStr = toDateStr(reserva.fechaHasta) ?? diasStrings[diasStrings.length - 1] ?? null;

  // ── Días y total ──────────────────────────────────────────────────────────
  // El precio no existe en la entidad Reserva, se calcula:
  //   cantidad de días reservados × tarifa por día de la publicación
  // Usamos diasReservados.length porque es la fuente de verdad (siempre persiste)
  const cantidadDias = diasStrings.length || (() => {
    // fallback: diferencia entre fechaDesde y fechaHasta si no hay diasReservados
    if (!fechaDesdeStr || !fechaHastaStr) return 0;
    const [y1, m1, d1] = fechaDesdeStr.split('-').map(Number);
    const [y2, m2, d2] = fechaHastaStr.split('-').map(Number);
    const ms = Math.abs(new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1));
    return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1; // +1 porque el rango es inclusivo
  })();

  const tarifaPorDia = publicacion?.tarifaPorDia ?? 0;
  const total = (cantidadDias - 1) * tarifaPorDia;

  return (
    <div className={`reserva-card-modern ${borderClass}`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="reserva-header-modern">
        <div className="reserva-imagen-container">
          {primeraImg ? (
            <>
              <img
                src={primeraImg.url || `http://localhost:3000${primeraImg.path}`}
                alt={publicacion?.titulo || 'Publicación'}
                className="reserva-imagen"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="reserva-placeholder" style={{ display: 'none' }}>🏠</div>
            </>
          ) : (
            <div className="reserva-placeholder">🏠</div>
          )}
        </div>

        <div className="reserva-info-principal">
          <h3 className="reserva-titulo">{publicacion?.titulo || 'Sin título'}</h3>

          {userType === 'dueno' ? (
            <div className="contacto-info">
              <p className="contacto-nombre">
                <strong>Cuidador:</strong> {cuidador?.nombre || cuidador?.email || 'N/A'}
              </p>
              {cuidador?.email && <p className="contacto-detalle">📧 {cuidador.email}</p>}
              {cuidador?.telefono && <p className="contacto-detalle">📱 {cuidador.telefono}</p>}
            </div>
          ) : (
            <div className="contacto-info">
              <p className="contacto-nombre">
                <strong>Dueño:</strong> {dueno?.nombre || dueno?.email || 'N/A'}
              </p>
              {dueno?.email && <p className="contacto-detalle">📧 {dueno.email}</p>}
              {dueno?.telefono && <p className="contacto-detalle">📱 {dueno.telefono}</p>}
            </div>
          )}

          <span className={`estado-badge ${badgeClass}`}>{label}</span>
        </div>
      </div>

      {/* ── Check-in / Check-out ─────────────────────────────────────────── */}
      <div className="reserva-fechas">
        <div className="fecha-item">
          <span className="fecha-label">Check-in</span>
          <span className="fecha-valor">{formatFecha(fechaDesdeStr)}</span>
        </div>
        <span className="fecha-separador">→</span>
        <div className="fecha-item">
          <span className="fecha-label">Check-out</span>
          <span className="fecha-valor">{formatFecha(fechaHastaStr)}</span>
        </div>
      </div>

      {/* ── Total ────────────────────────────────────────────────────────── */}
      <div className="reserva-costo">
        <p className="costo-detalle">
          {cantidadDias > 0
            ? `$${tarifaPorDia} × ${cantidadDias} ${cantidadDias === 1 ? 'día' : 'días'}`
            : 'Sin días reservados'}
        </p>
        <div className="costo-total">
          <span className="total-label">{userType === 'cuidador' ? 'Ganancia:' : 'Total:'}</span>
          <span className="total-valor">{cantidadDias > 0 ? `$${total}` : '—'}</span>
        </div>
      </div>

      {/* ── Mascotas preview ─────────────────────────────────────────────── */}
      <div className="mascotas-preview">
        <strong>Mascotas:</strong>
        <div className="mascotas-lista">
          {reserva.mascotas?.length > 0 ? (
            reserva.mascotas.map((m, i) => {
              const nombre = m.nomMascota || m.nombre || 'Sin nombre';
              const imgSrc = m.imagen?.path
                ? `http://localhost:3000${m.imagen.path}`
                : (m.imagen?.url ?? null);
              return (
                <div key={i} className="mascota-chip">
                  {imgSrc && (
                    <img src={imgSrc} alt={nombre} className="mascota-avatar"
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <span>{nombre}</span>
                </div>
              );
            })
          ) : (
            <span className="no-data">Sin especificar</span>
          )}
        </div>
      </div>

      {/* ── Ver más ──────────────────────────────────────────────────────── */}
      <button className="btn-expandir" onClick={() => setExpanded(!expanded)}>
        {expanded ? '▲ Ver menos' : '▼ Ver más detalles'}
      </button>

      {/* ── Detalles expandidos ───────────────────────────────────────────── */}
      {expanded && (
        <div className="detalles-expandidos">
          {reserva.descripcion && (
            <div className="detalle-seccion">
              <h4>Notas</h4>
              <p>{reserva.descripcion}</p>
            </div>
          )}

          <div className="detalle-seccion">
            <h4>Detalles de la publicación</h4>
            <p><strong>Ubicación:</strong> {publicacion?.ubicacion || 'N/A'}</p>
            <p><strong>Tipo:</strong> {publicacion?.tipoAlojamiento || 'N/A'}</p>
            {publicacion?.exotico && <p className="exotico-tag">✨ Acepta mascotas exóticas</p>}
          </div>

          {reserva.mascotas?.length > 0 && (
            <div className="detalle-seccion">
              <h4>Información de mascotas</h4>
              {reserva.mascotas.map((m, i) => (
                <div key={i} className="mascota-detalle">
                  <p><strong>{m.nomMascota || m.nombre}</strong></p>
                  <p>Especie: {resolveStr(m.especie)}</p>
                  <p>Raza: {resolveStr(m.raza)}</p>
                  <p>Edad: {m.edad} años</p>
                </div>
              ))}
            </div>
          )}

          {diasStrings.length > 0 && (
            <div className="detalle-seccion">
              <h4>Días reservados ({diasStrings.length})</h4>
              <div className="dias-grid">
                {diasStrings.map((str, i) => {
                  const [y, mo, dy] = str.split('-').map(Number);
                  return (
                    <span key={i} className="dia-chip">
                      {new Date(y, mo - 1, dy).toLocaleDateString('es-AR', {
                        day: 'numeric', month: 'short',
                      })}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Acciones ─────────────────────────────────────────────────────── */}
      {userType === 'dueno' && (
        <div className="reserva-acciones">
          <button className="btn-accion btn-cancelar" onClick={() => onCancelar(reservaId)}>
            Cancelar Reserva
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservaCard;