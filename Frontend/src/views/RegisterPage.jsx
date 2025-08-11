
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
    confirmarPassword: '',
    tipoUsuario: '',
    tipoDocumento: '',
    nroDocumento: '',
    telefono: '',
    telefonoEmergencia: '',
    sexo:'',
    edad: ''

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
      const response = await fetch('http://localhost:3307/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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
          confirmarPassword: '',
          tipoUsuario: '',
          tipoDocumento: '',
          nroDocumento: '',
          telefono: '',
          telefonoEmergencia: '',
          sexo: '',
          edad: ''
        });
      }

    } catch {
      setError('Error de conexión con el servidor');
    }
  };




  return (
    <div className="auth-container-register">
      <h4>Registrarse</h4>

      {/* Selector de tipoUusuario */}
      <div className= "selector-tipo">
        <div className= "opciones-tipo">
        <button
          type= "button"
          className= {formData.tipoUsuario === "dueño" ? "selected" : ""}
          onClick={() => setFormData({ ...formData, tipoUsuario: "dueño" })}
        >
         Dueño
        </button>
        
        <button
          type="button"
          className={formData.tipoUsuario === "cuidador" ? "selected" : ""}
          onClick={() => setFormData({ ...formData, tipoUsuario: "cuidador" })}
        >
        Cuidador
        </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Campos comunes */}
        <label>Nombre completo:</label>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
        />

        <label>Correo electrónico:</label>
        <input
          type="email"
          name="email"
          placeholder="tuemail@ejemplo.com"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Contraseña:</label>
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

        {/* Campos específicos */}
        {formData.tipoUsuario && (
          <>
            <label>Tipo de documento:</label>
            <input
              type="text"
              name="tipoDocumento"
              placeholder="DNI / Pasaporte / etc."
              value={formData.tipoDocumento}
              onChange={handleChange}
            />

            <label>Número de documento:</label>
            <input
              type="text"
              name="nroDocumento"
              placeholder="Número de documento"
              value={formData.nroDocumento}
              onChange={handleChange}
            />

            <label>Teléfono:</label>
            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
            />

            {formData.tipoUsuario === "dueño" && (
              <>
                <label>Teléfono de emergencia:</label>
                <input
                  type="text"
                  name="telefonoEmergencia"
                  placeholder="Teléfono de emergencia"
                  value={formData.telefonoEmergencia}
                  onChange={handleChange}
                />
              </>
            )}

            {formData.tipoUsuario === "cuidador" && (
              <>
                <label>Sexo:</label>
                <input
                  type="text"
                  name="sexo"
                  placeholder="Sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                />

                <label>Edad:</label>
                <input
                  type="number"
                  name="edad"
                  placeholder="Edad"
                  value={formData.edad}
                  onChange={handleChange}
                />
              </>
            )}
          </>
        )}

        <button type="submit">Registrarse</button>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;