

import React, { createContext, useState, useContext, useEffect } from 'react';


const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));


useEffect(() => {
  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticación...');
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        console.log('👤 Usuario encontrado en localStorage');
        setUser(JSON.parse(savedUser));
      }
      
      const response = await fetch('http://localhost:3000/api/usuario/me', {
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(' DATOS COMPLETOS DEL BACKEND:', data);
        
        if (data.usuario) {
          console.log('✅ Usuario encontrado:', data.usuario);
          setUser(data.usuario);
          localStorage.setItem('user', JSON.stringify(data.usuario));
        } else {
          console.log(' No se encontró data.usuario ');
          console.log('Estructura completa:', data);
        }
      } else {
        console.log(' Response no ok:', response.status);   
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error(' Error verificando autenticación:', error);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } finally {
      setLoading(false);
    }
  };
  
  checkAuth();
}, []);


const login = async (email, password) => {
  try {
    let response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

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
      localStorage.setItem('token', 'authenticated'); 
      
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
          localStorage.setItem('user', JSON.stringify(userData.usuario));
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

  const register = async (formData) => {
    try {
      const endpoint = formData.tipoUsuario === 'cuidador' 
        ? 'http://localhost:3000/api/cuidadores'
        : 'http://localhost:3000/api/duenos';

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include', 
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
    isAuthenticated: !!user,
    isCuidador: user?.tipoUsuario === 'cuidador',
    isDueno: user?.tipoUsuario === 'dueño' || user?.tipoUsuario === 'dueno',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthProvider;
