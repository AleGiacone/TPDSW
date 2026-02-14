import React, { useState, useEffect, useCallback } from 'react';
import { loginCtrl, logoutCtrl, registerCtrl } from '../services/authService';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }) => {
    // ─── FIX: Initialize from localStorage immediately ────────────────────────
    // This prevents the flash where user=null before checkAuth() resolves,
    // which was causing ProtectedRoute to redirect to /login on Stripe return.
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    // loading starts false if we already have a user in localStorage,
    // so ProtectedRoute never sees the unauthenticated flash.
    const [loading, setLoading] = useState(() => {
        return !localStorage.getItem('user');
    });

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/usuarios/me', {
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
            // On network error, keep whatever is in localStorage
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch {
                    setUser(null);
                }
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
            const data = await response.json();

            if (response.ok && data.success) {
                const userData = data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.message || 'Error al iniciar sesión'
                };
            }
        } catch {
            return {
                success: false,
                error: 'Error de conexión con el servidor'
            };
        }
    };

    const logout = async () => {
        try {
            await logoutCtrl();
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    const register = async (formData) => {
        try {
            const response = await registerCtrl(formData);
            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Error en el registro'
                };
            }
        } catch {
            return {
                success: false,
                error: 'Error de conexión'
            };
        }
    };

    const updateUser = (newUserData) => {
        if (newUserData) {
            const updatedUser = { ...user, ...newUserData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        updateUser,
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