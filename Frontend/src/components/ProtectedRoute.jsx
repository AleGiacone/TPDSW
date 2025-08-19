
import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Verificar si hay un token al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tu backend usa cookies, no localStorage
        // Llamar al endpoint para verificar si hay sesión activa
        const response = await fetch('http://localhost:3000/api/usuario/me', {
          credentials: 'include', // Importante para enviar cookies
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.usuario) {
            setUser(data.usuario);
            setToken('authenticated'); // Solo para indicar que está autenticado
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Probamos primero /api/login, si no funciona probamos /api/usuarios/login
      let response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Si el primer endpoint falla, probamos el segundo
      if (!response.ok && response.status === 404) {
        response = await fetch('http://localhost:3000/api/usuarios/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
      }

      if (response.ok) {
        await response.json();
        setToken('authenticated');
        
        
        // Intentamos obtener datos del usuario después del login
        try {
          const userResponse = await fetch('http://localhost:3000/api/usuario/me', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData.usuario);
          }
        } catch (error) {
          console.error('Error obteniendo datos del usuario:', error);
        }
        
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || errorData.message || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
    setToken(null);
    setUser(null);
  };

  const register = async (formData) => {
    try {
      // Determinar endpoint según tipo de usuario
      const endpoint = formData.tipoUsuario === 'cuidador' 
        ? 'http://localhost:3000/api/cuidadores'
        : 'http://localhost:3000/api/duenos';

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include', // Por si acaso el backend setea alguna cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || errorData.error || 'Error en el registro' };
      }
    } catch  {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!token,
    isCuidador: user?.tipoUsuario === 'cuidador',
    isDueno: user?.tipoUsuario === 'dueño' || user?.tipoUsuario === 'dueno',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};