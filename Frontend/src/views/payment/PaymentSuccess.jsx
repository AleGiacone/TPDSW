import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PaymentPages.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    console.log('🎉 PaymentSuccess montado');
    console.log('📦 localStorage.user:', localStorage.getItem('user'));
    console.log('🍪 document.cookie:', document.cookie);

    // Verificar si hay usuario en localStorage
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      console.error('❌ NO HAY USUARIO EN LOCALSTORAGE');
      console.log('Redirigiendo a login en 2 segundos...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        console.log('⏱️ Countdown:', prev - 1);
        return prev <= 1 ? 0 : prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      console.log('⏰ Timeout alcanzado, redirigiendo...');
      console.log('📦 localStorage antes de redirigir:', localStorage.getItem('user') ? 'EXISTE' : 'NO EXISTE');
      navigate('/dashboards/dueno?from=payment', { replace: true });
    }, 3000);

    return () => {
      console.log('🧹 PaymentSuccess desmontado');
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  const handleGoToReservas = () => {
    console.log('🖱️ Click en botón');
    const savedUser = localStorage.getItem('user');
    console.log('📦 localStorage.user:', savedUser ? 'EXISTE' : 'NO EXISTE');

    if (savedUser) {
      navigate('/dashboards/dueno?from=payment', { replace: true });
    } else {
      console.error('❌ No hay usuario, redirigiendo a login');
      navigate('/login');
    }
  };

  return (
    <div className="payment-page-container">
      <div className="payment-card success">
        <div className="payment-icon success-icon">✓</div>
        <h1>¡Pago exitoso!</h1>
        <p className="payment-message">
          Tu reserva ha sido confirmada y el pago se procesó correctamente.
        </p>
        <div className="payment-details">
          <p className="redirect-message">
            Redirigiendo en <strong>{countdown} segundos</strong>...
          </p>
        </div>
        <button
          onClick={handleGoToReservas}
          className="btn-primary payment-btn"
        >
          Ir al dashboard ahora
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;