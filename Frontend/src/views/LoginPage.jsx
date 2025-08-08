import React, { useState } from'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';
import { loginCtrl } from '../api/auth';
import Navbar from '../components/Navbar';



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

