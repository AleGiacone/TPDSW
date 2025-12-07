import React from 'react';
import PublicacionCard from './PublicacionCard';
import '../styles/PrivateHomePage.css';

/**
 * Grid de publicaciones reutilizable
 * @param {Array} publicaciones - Array de publicaciones a mostrar
 * @param {Boolean} loading - Estado de carga
 * @param {String} error - Mensaje de error si existe
 * @param {Function} onRetry - Función para reintentar carga
 * @param {Function} renderCardActions - Función que retorna los botones de acción para cada card
 * @param {String} emptyMessage - Mensaje cuando no hay publicaciones
 * @param {Boolean} showCuidadorInfo - Mostrar info del cuidador en cada card
 * @param {Boolean} isSelectable - Las cards son seleccionables
 * @param {Function} onCardClick - Callback cuando se hace click en una card
 * @param {Number} selectedCardId - ID de la card seleccionada
 */
const PublicacionesGrid = ({
  publicaciones = [],
  loading = false,
  error = '',
  onRetry = null,
  renderCardActions = null,
  emptyMessage = 'No se encontraron publicaciones',
  showCuidadorInfo = true,
  isSelectable = false,
  onCardClick = null,
  selectedCardId = null
}) => {

  // Estado de carga
  if (loading) {
    return (
      <div className="loading-section">
        <div className="loading-spinner">🔄</div>
        <p>Cargando publicaciones...</p>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="error-section">
        <p>⚠️ {error}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-btn">
            Reintentar
          </button>
        )}
      </div>
    );
  }

  // Estado vacío
  if (!Array.isArray(publicaciones) || publicaciones.length === 0) {
    return (
      <div className="empty-state">
        <h3>{emptyMessage}</h3>
        <p>Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  // Renderizar grid
  return (
    <div className="publicaciones-grid">
      {publicaciones.map((pub) => {
        const pubId = pub.idPublicacion || pub.id;

        return (
          <PublicacionCard
            key={pubId}
            publicacion={pub}
            showActions={!!renderCardActions}
            actionButtons={renderCardActions ? renderCardActions(pub) : null}
            showCuidadorInfo={showCuidadorInfo}
            isSelectable={isSelectable}
            isSelected={selectedCardId === pubId}
            onClick={onCardClick}
          />
        );
      })}
    </div>
  );
};

export default PublicacionesGrid;