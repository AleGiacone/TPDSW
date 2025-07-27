
import React, { useState } from'react';
//import { useNavigate } from 'react-router-dom';
//import { register } from '../api/auth.js';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmarPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://localhost:5173/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
          // Agregar tipoUsuario si es duenio o cuidador los demas campos no son obligatorios
          
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error en el registro');
      } else {
        setSuccess('Registro exitoso');
        // Opcional: redirigir o limpiar formulario
        // window.location.href = '/login';
        setFormData({
          nombre: '',
          email: '',
          password: '',
          confirmarPassword: ''
        });
      }

    } catch {
      setError('Error de conexión con el servidor');
    }
  };




  return (
    <div className="auth-container">
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmarPassword"
          placeholder="Confirmar contraseña"
          value={formData.confirmarPassword}
          onChange={handleChange}
        />

        <button type="submit">Registrarse</button>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;