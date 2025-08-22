import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';


/*import useAuth from '../hooks/useAuth';

function Dashboard() {
  const { user, logout } = useAuth();*/

  
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

    // Validaciones básicas
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
    <div className="auth-container-register">
      <h4>Registrarse</h4>

      {/* Selector de tipoUsuario */}
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
        {/* Campos comunes */}
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

        {/* Campos específicos */}
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
  );
};

export default RegisterPage;




/*import React, { useState } from'react';
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
      const response = await fetch('http://localhost:3000/api/cuidadores', {
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

      {/* Selector de tipoUusuario */
  /*    <div className= "selector-tipo">
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
        {/* Campos comunes */
   /*     <label>Nombre completo:</label>
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

        {/* Campos específicos */
    /*    {formData.tipoUsuario && (
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

export default RegisterPage*/