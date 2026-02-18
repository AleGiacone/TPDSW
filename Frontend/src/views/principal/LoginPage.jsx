import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';

function LoginPage() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const tipo = user.tipoUsuario?.toLowerCase();
      if (tipo === 'cuidador') navigate('/dashboards/cuidador');
      else if (tipo === 'dueno' || tipo === 'dueño' || tipo === 'duenio') navigate('/dashboards/dueno');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) { setErrorMsg('Por favor, complete todos los campos.'); return; }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.requires2FA) { setRequires2FA(true); return; }
      if (!result?.success) setErrorMsg(result?.error || 'Credenciales incorrectas.');
    } catch { setErrorMsg('Error de conexión. Intentá más tarde.'); }
    finally { setLoading(false); }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (twoFACode.length !== 6) { setErrorMsg('El código debe tener 6 dígitos.'); return; }
    setLoading(true);
    try {
      const result = await login(email, password, twoFACode);
      if (!result?.success) {
        setErrorMsg(
          result?.error?.includes('2FA') || result?.error?.includes('Invalid')
            ? 'Código incorrecto. Revisá tu app autenticadora.'
            : result?.error || 'Error al verificar el código.'
        );
        setTwoFACode('');
      }
    } catch { setErrorMsg('Error de conexión. Intentá más tarde.'); }
    finally { setLoading(false); }
  };

  // ── Vista 2FA ────────────────────────────────────────────────
  if (requires2FA) {
    return (
      <div className="auth-page-layout">
        <Navbar />
        <div className="auth-wrapper auth-page-wrapper">
          <div className="auth-container">
            <div className="twofa-card">
              <span className="twofa-icon">🔐</span>
              <p className="twofa-title">Verificación en dos pasos</p>
              <p className="twofa-subtitle">
                Ingresá el código de 6 dígitos de tu app autenticadora
              </p>
              <form className="twofa-form" onSubmit={handle2FASubmit}>
                <div className="twofa-field">
                  <label htmlFor="twofa-code" className="twofa-label">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    id="twofa-code"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="twofa-input"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    disabled={loading}
                  />
                  {errorMsg && <p className="twofa-error">{errorMsg}</p>}
                </div>
                <div className="twofa-buttons">
                  <button
                    type="submit"
                    className="btn-verify"
                    disabled={loading || twoFACode.length !== 6}
                  >
                    {loading ? 'Verificando...' : 'Verificar código'}
                  </button>
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => { setRequires2FA(false); setTwoFACode(''); setErrorMsg(''); }}
                    disabled={loading}
                  >
                    ← Volver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista login normal ───────────────────────────────────────
  return (
    <div className="auth-page-layout">
      <Navbar />
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
                disabled={loading}
              />
              <label htmlFor="password" className="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                value={password}
                placeholder="Tu contraseña"
                onChange={(e) => setPassword(e.target.value)}
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