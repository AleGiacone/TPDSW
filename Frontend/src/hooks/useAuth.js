import { useContext } from 'react';
import { AuthProvider } from '../context/AuthContext'; // Ajusta la ruta según tu estructura

const useAuth = () => {
  const context = useContext(AuthProvider);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;