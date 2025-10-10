/* Este archivo es el corazón de tu autenticación. Su única responsabilidad es crear y gestionar el estado global del usuario y exponer las funciones que otros componentes usarán para interactuar con él (iniciar sesión, cerrar sesión, registrarse, etc.).

¿Qué va aquí?

Creación del contexto: const AuthContext = createContext();.

El componente AuthProvider: Es el que envuelve a toda tu aplicación y provee el estado del usuario (user, loading) a sus componentes hijos.

El estado de React: useState para el usuario (user) y el estado de carga (loading).

Lógica de autenticación inicial: El useEffect y la función checkAuth que verifican si hay un usuario logueado al cargar la página.

Funciones para exponer: Las funciones login, logout y register que serán llamadas por otros componentes. Estas funciones solo deben llamar a los servicios de la API, no contener la lógica fetch.

En resumen: En este archivo, te enfocas en qué estados y funciones provees, no en cómo funcionan las llamadas a la API. */

import React, {  useState, useEffect, useCallback } from 'react';
import { loginCtrl, logoutCtrl, registerCtrl } from '../services/authService';
import { AuthContext } from './AuthContextBase';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuario/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.usuario) {
          setUser(data.usuario);
          localStorage.setItem('user', JSON.stringify(data.usuario));
        } else {
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await loginCtrl(email, password);
      if (response.ok) {
        await checkAuth(); // Sincroniza el estado con el backend
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    try {
      await logoutCtrl();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const register = async (formData) => {
    try {
      const response = await registerCtrl(formData);
      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Error en el registro' };
      }
    } catch  {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const value = {
    user,
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