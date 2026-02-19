import React, { useState, useEffect, useCallback } from 'react';
import { loginCtrl, logoutCtrl, registerCtrl } from '../services/authService';
import { AuthContext } from './AuthContextBase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api`;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(() => {
        return !localStorage.getItem('user');
    });

    // Busca perfil completo usuario
    const fetchFullProfile = useCallback(async (userData) => {
        if (!userData?.idUsuario || !userData?.tipoUsuario) return userData;
        try {
            const tipo = userData.tipoUsuario;
            let endpoint = '';
            if (tipo === 'cuidador') {
                endpoint = `${BASE_URL}/api/cuidador/${userData.idUsuario}`;
            } else if (tipo === 'dueno' || tipo === 'dueño') {
                endpoint = `${BASE_URL}/api/duenos/${userData.idUsuario}`;
            } else {
                return userData;
            }
            const response = await fetch(endpoint, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                // Fusiona los datos base con los datos completos del perfil
                return { ...userData, ...(data.data || {}) };
            }
        } catch (error) {
            console.error('Error al cargar perfil completo:', error);
        }
        return userData;
    }, []);

    const checkAuth = useCallback(async () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                // Siempre refrescar perfil completo al cargar
                const fullUser = await fetchFullProfile(parsedUser);
                setUser(fullUser);
                localStorage.setItem('user', JSON.stringify(fullUser));
                setLoading(false);
                return;
            } catch {
                // Si el localStorage está corrupto, continuar
            }
        }

        try {
            const response = await fetch(`${BASE_URL}/api/usuarios/me`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.usuario) {
                    const fullUser = await fetchFullProfile(data.usuario);
                    setUser(fullUser);
                    localStorage.setItem('user', JSON.stringify(fullUser));
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
            const saved = localStorage.getItem('user');
            if (saved) {
                try { setUser(JSON.parse(saved)); } catch { setUser(null); }
            }
        } finally {
            setLoading(false);
        }
    }, [fetchFullProfile]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);


    const login = async (email, password, twoFAToken = null) => {
        try {
            // Armar el body — solo agrega token si se proporciona
            const body = { email, password };
            if (twoFAToken) body.token = twoFAToken;

            const response = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            const data = await response.json();

            //  usuario tiene 2FA activo pero no se envió el token ──
            if (response.status === 400 && data.message === '2FA code is required') {
                return { success: false, requires2FA: true };
            }

            // código 2FA incorrecto ──
            if (response.status === 400 && data.message === 'Invalid 2FA code') {
                return { success: false, error: 'Invalid 2FA code' };
            }

            // credenciales incorrectas u otro error ──
            if (!response.ok || !data.success) {
                return { success: false, error: data.message || 'Credenciales incorrectas' };
            }

            // ── Login exitoso 
            const fullUser = await fetchFullProfile(data.user);
            setUser(fullUser);
            localStorage.setItem('user', JSON.stringify(fullUser));

            return { success: true };

        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: 'Error de conexión. Intentá más tarde.' };
        }
    };

    const logout = async () => {
        try { await logoutCtrl(); } catch (error) { console.error('Error en logout:', error); }
        finally { setUser(null); localStorage.removeItem('user'); }
    };

    const register = async (formData) => {
        try {
            const response = await registerCtrl(formData);
            if (response.ok) return { success: true };
            const errorData = await response.json();
            return { success: false, error: errorData.message || 'Error en el registro' };
        } catch {
            return { success: false, error: 'Error de conexión' };
        }
    };

    const updateUser = (newUserData) => {
        if (newUserData) {
            const updatedUser = { ...user, ...newUserData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

  
    const refreshProfile = useCallback(async () => {
        if (user) {
            const fullUser = await fetchFullProfile(user);
            setUser(fullUser);
            localStorage.setItem('user', JSON.stringify(fullUser));
        }
    }, [user, fetchFullProfile]);

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        updateUser,
        refreshProfile,
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