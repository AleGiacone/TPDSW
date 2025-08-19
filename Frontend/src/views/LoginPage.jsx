import React, { useState, useEffect } from'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';
//import { useAuth } from '../context/AuthContext';
//import { loginCtrl } from '../api/auth';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';

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
      if (user.tipoUsuario === 'cuidador') {
        navigate('/dashboard/cuidador');
      } else if (user.tipoUsuario === 'dueno' || user.tipoUsuario === 'dueño') {
        navigate('/dashboard/dueno');
      } else {
        navigate('/dashboard');
      }
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
      
      <p>
        ¿No tienes cuenta? <Link to="/register">Registrarse</Link>
      </p>
    </div>
  );
}

export default LoginPage;

/*
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!email || !password ) {
      setErrorMsg ('Por favor, complete todos los campos.')
      return;
    }

    
    try {
      const response = await loginCtrl(email, password);
      if(response.ok) {
        const data = await response.json();
        localStorage.setItem ('token' , data.token ) //guarda el token
        navigate ('/');
        } else {
          const errorData = await response.json();
          setErrorMsg ( errorData.error || 'Error al iniciar sesion. Por favor, intentelo de nuevo.')
        }
    }   catch (error) {
        setErrorMsg ('Error de conexion del servidor. Por favor, intente mas tarde');
        console.error(error);
        }
  }


return (
    <div className="auth-container">
      <h3>Iniciar Sesión</h3>
      <form className="auth-form input" onSubmit={handleSubmit}>
        <div className= "form-group">
        <label htmlFor="email">Correo electrónico:</label>
        <input
          type="email"
          id="email"
          value={email}
          placeholder="tuemail@ejemplo.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          value={password}
          placeholder="Tu contraseña" 
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        </div>
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}


export default LoginPage;
*/
