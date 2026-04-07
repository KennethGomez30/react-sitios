// ─── useAuth Hook ─────────────────────────────────────────────────────────────
// Maneja el estado global de autenticación.
// Úsalo en cualquier componente que necesite saber si hay sesión activa.

import { useState, useCallback } from 'react';
import {
    login as loginService,
    logout as logoutService,
    getUsuarioActual,
    haySesionActiva,
} from '../services/authService';
import type { LoginCredentials, Usuario } from '../types/auth';

interface UseAuthReturn {
    usuario: Usuario | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export function useAuth(): UseAuthReturn {
    const [usuario, setUsuario] = useState<Usuario | null>(() => getUsuarioActual());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => haySesionActiva());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await loginService(credentials);

            if (response.success) {
                setUsuario(response.usuario);
                setIsAuthenticated(true);
                return true;
            }

            // El backend puede retornar success: false con un mensaje
            setError(response.message ?? 'Usuario y/o contraseña incorrectos.');
            return false;
        } catch (err) {
            // Errores de red o respuestas 4xx/5xx
            const message =
                err instanceof Error ? err.message : 'Error de conexión. Intente más tarde.';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            await logoutService();
        } finally {
            setUsuario(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        usuario,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        clearError,
    };
}