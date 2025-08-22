import { useContext } from 'react';
import { AuthProvider } from '../context/AuthContext'; 

export const useAuth = () => {
  const context = useContext(AuthProvider);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default useAuth;