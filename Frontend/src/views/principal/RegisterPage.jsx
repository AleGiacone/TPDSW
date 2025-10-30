import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
  
const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
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
    sexo: '',
    edad: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmarPassword) {
      setError('Todos los campos obligatorios deben completarse');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!formData.tipoUsuario) {
      setError('Debe seleccionar un tipo de usuario');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        setSuccess('¡Registro exitoso! Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Error inesperado. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-layout">
    <Navbar />
    <div className="auth-wrapper auth-page-wrapper">
    <div className="auth-container-register">
      <h4>Registrarse</h4>

      <div className="selector-tipo">
        <div className="opciones-tipo">
          <button
            type="button"
            className={formData.tipoUsuario === "dueno" ? "selected" : ""}
            onClick={() => setFormData({ ...formData, tipoUsuario: "dueno" })}
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
        <label>Nombre completo:</label>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <label>Correo electrónico:</label>
        <input
          type="email"
          name="email"
          placeholder="tuemail@ejemplo.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Contraseña:</label>
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmarPassword"
          placeholder="Confirmar contraseña"
          value={formData.confirmarPassword}
          onChange={handleChange}
          required
        />

        {formData.tipoUsuario && (
          <>
            <label>Tipo de documento:</label>
                <select
                  name="Tipo de documento"
                  value={formData.tipoDoc}
                  onChange={handleChange}
                >
                  <option value="dni">DNI</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="otro">Otro</option>
                </select>
            

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

            {formData.tipoUsuario === "dueno" && (
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
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>

                <label>Edad:</label>
                <input
                  type="number"
                  name="edad"
                  placeholder="Edad"
                  value={formData.edad}
                  onChange={handleChange}
                  min="18"
                  max="100"
                />
              </>
            )}
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
      </div>
    </div>
    </div>
  );
};

export default RegisterPage;


