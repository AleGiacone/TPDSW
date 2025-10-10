/* Este archivo es un hook personalizado. Su única función es proporcionar una forma sencilla para que cualquier componente de tu aplicación acceda a los valores del AuthContext.

¿Qué va aquí?

La función useAuth: Un hook que usa useContext para leer los valores (user, login, logout, etc.) del AuthContext y devolverlos.

Manejo de errores: Un if para asegurar que el hook se use dentro de AuthProvider, lanzando un error si no es así.

En resumen: Este archivo es un "puente" entre el proveedor y los componentes. Te permite usar la información de autenticación sin tener que importar el contexto directamente en cada archivo. */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextBase';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};