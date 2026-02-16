import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/PaymentPages.css';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="payment-page-container">
        <div className="payment-card cancel">
          <div className="loading-spinner"></div>
          <p className="loading-text">Verificando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="payment-page-container">
      <div className="payment-card cancel">
        <div className="payment-icon cancel-icon">
          <span className="cross-mark">✕</span>
        </div>
        <h1>Pago Cancelado</h1>
        <p className="payment-message">
          Se ha cancelado el proceso de pago. No se va a realizar ningún cargo.
        </p>
        <div className="payment-details">
          <div className="detail-item">
            <span className="emoji">ℹ️</span>
            <p>Tu reserva no ha sido procesada</p>
          </div>
          <div className="detail-item">
            <span className="emoji">🔄</span>
            <p>Podes volver a intentarlo cuando estés listo</p>
          </div>
        </div>
        <div className="payment-actions">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary payment-btn"
          >
            Ver publicaciones
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary payment-btn"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;