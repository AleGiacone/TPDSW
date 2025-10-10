import React, { useState, useEffect } from'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../../styles/Auth.css';
//import { loginCtrl } from '../api/auth';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';

function LoginPage() {
  
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirigir después de que se actualice el usuario
   useEffect(() => {
     if (user) {
       navigate('/dashboard'); 
     }
   }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Por favor, complete todos los campos.');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setErrorMsg(result.error);
      }
      // El redirect se maneja en useEffect cuando user se actualiza
    } catch (error) {
      setErrorMsg('Error de conexión del servidor. Por favor, intente más tarde.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h3>Iniciar Sesión</h3>
      <form className="auth-form input" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            placeholder="tuemail@ejemplo.com"
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            placeholder="Tu contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          
          {errorMsg && <p className="error-message">{errorMsg}</p>}
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;

