import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/PaymentPages.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Contador regresivo
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // ✅ FIX: redirigir al dashboard con ?view=reservas para abrir la sección correcta
    const timer = setTimeout(() => {
      if (user?.tipoUsuario?.toLowerCase() === 'dueno') {
        navigate('/dashboards/dueno?view=reservas');
      } else {
        navigate('/');
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate, user]);

  const handleGoToReservas = () => {
    if (user?.tipoUsuario?.toLowerCase() === 'dueno') {
      navigate('/dashboards/dueno?view=reservas');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="payment-page-container">
      <div className="payment-card success">
        <div className="payment-icon success-icon">✓</div>
        <h1>¡Pago Exitoso!</h1>
        <p className="payment-message">
          Tu reserva ha sido confirmada y el pago se procesó correctamente.
        </p>
        <div className="payment-details">
          <p>Recibirás un correo electrónico con los detalles de tu reserva.</p>
          <p className="redirect-message">
            Redirigiendo a tus reservas en <strong>{countdown} segundos</strong>...
          </p>
        </div>
        <button
          onClick={handleGoToReservas}
          className="btn-primary payment-btn"
        >
          Ver mis reservas ahora
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;