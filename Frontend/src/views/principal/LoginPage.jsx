import React, { useState, useEffect } from'react';
import { Link } from 'react-router-dom';
import '../../styles/Auth.css';
import { useNavigate} from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';

function LoginPage() {
 
 const { login, user } = useAuth();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [errorMsg, setErrorMsg] = useState('');
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();

 useEffect(() => {
  if(user) {
    const tipo= user.tipoUsuario?.toLowerCase();
     if (tipo === 'cuidador') {
 navigate('/dashboards/cuidador'); // ✅ REDIRECCIÓN CUIDADOR
} else if (tipo === 'dueno' || tipo === 'dueño' || tipo === 'duenio') {
 navigate('/dashboards/dueno');  // REDIRECCIÓN DUEÑO
} else {
 navigate('/');
}}
 }, [user, navigate]); // Dependencias: user y navigate
  
 

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
   // ✅ CAMBIO 1: Envía las credenciales como un objeto.
   // Si tu hook `login` espera dos argumentos, deberías adaptarlo.
   // Si no, envíalos como objeto: `await login({ email, password });`
   const result = await login(email, password); // Asumimos que tu hook espera email, password
   
   if (!result || !result.success) { // ✅ CAMBIO 2: Manejo de error si el hook falla
    setErrorMsg(result?.error || 'Error al iniciar sesión. Verifique credenciales.');
   }
   // 🚨 NOTA: El redirect (a /dashboards/cuidador o /dashboards/dueno) 
   // ahora es responsabilidad del hook `login` en `useAuth.jsx`.
  } catch (error) {
   setErrorMsg('Error de conexión del servidor. Por favor, intente más tarde.');
   console.error(error);
  } finally {
   setLoading(false);
  }
 };
 return (
  <div className="page-wrapper">
  <div className="auth-wrapper auth-page-wrapper">
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
  </div>
  </div>
);
}

export default LoginPage;