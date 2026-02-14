import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PaymentPages.css';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-page-container">
      <div className="payment-card cancel">
        <div className="payment-icon cancel-icon">
          ✕
        </div>
        <h1>Pago Cancelado</h1>
        <p className="payment-message">
          Has cancelado el proceso de pago. No se ha realizado ningún cargo.
        </p>
        <div className="payment-details">
          <p>Tu reserva no ha sido creada.</p>
          <p>Puedes volver a intentarlo cuando estés listo.</p>
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