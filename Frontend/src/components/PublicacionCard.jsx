import React from 'react';
import ImageCarousel from './ImageCarousel';
import '../styles/PublicacionesCard.css';
import { Calendar, X, AlertCircle, Upload, Trash2, Home, CalendarCheck, User, LogOut, Cat, Dog } from 'lucide-react';

const PublicacionCard = ({
  publicacion,
  showActions = true,
  actionButtons = null,
  onClick = null,
  isSelectable = false,
  isSelected = false,
  showCuidadorInfo = true
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(publicacion);
    }
  };

  return (
    <div
      key={publicacion.idPublicacion || publicacion.id}
      className={`publicacion-card ${isSelectable ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={isSelectable ? handleCardClick : undefined}
      style={{ cursor: isSelectable ? 'pointer' : 'default' }}
    >
      {/* Carrusel de imágenes */}
      <div className="card-image-wrapper">
        <ImageCarousel
          imagenes={publicacion.imagenes || []}
          titulo={publicacion.titulo}
        />
      </div>

      {/* Contenido de la tarjeta */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{publicacion.titulo}</h3>
          {showCuidadorInfo && publicacion.idCuidador && (
            <div className="cuidador-info">
              <span className="cuidador-name">
                Por: {publicacion.idCuidador?.nombre || 'Cuidador'}
              </span>
            </div>
          )}
        </div>

        <p className="card-description">{publicacion.descripcion}</p>

        {/* Detalles de la publicación */}
        <div className="card-details">
          <div className="detail-item">
            <div style={{color: '#222', fontWeight: 700}}>{publicacion.ubicacion}</div>
          </div>
          <div className="detail-item">
            <span className="detail-label"><Home size={20} /> Tipo de alojamiento:</span>
            <span>{publicacion.tipoAlojamiento}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label"><Dog size={20} /> Max animales:</span>
            <span>{publicacion.cantAnimales}</span>
          </div>
          {publicacion.exotico && (
            <div className="exotic-badge">
              Acepta exóticas
            </div>
          )}
        </div>
      </div>

      {/* Footer con precio y acciones */}
      {showActions && (
        <div className="card-footer">
          <div className="price-section">
            <span className="price">${publicacion.tarifaPorDia}</span>
            <span className="price-period">/ día</span>
          </div>
          {actionButtons && (
            <div className="card-actions">
              {actionButtons}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicacionCard;