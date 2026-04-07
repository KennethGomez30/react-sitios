// Equivalente a la lógica del login.php, pero delegando al backend Node.js.
// El backend es responsable de validar credenciales, manejar intentos,
// bloquear usuarios, registrar bitácora y emitir el JWT.

import { apiClient } from './api';
import type { LoginCredentials, LoginResponse, Usuario } from '../types/auth';

// Claves usadas en localStorage
const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';

// Operaciones de sesión

// Guarda token y datos del usuario tras un login exitoso
function guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

// Elimina todos los datos de sesión (equivalente al logout del PHP)
export function limpiarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
}

// Devuelve el usuario guardado en sesión, o null si no existe 
export function getUsuarioActual(): Usuario | null {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as Usuario;
    } catch {
        return null;
    }
}

// Devuelve true si hay una sesión activa con token 
export function haySesionActiva(): boolean {
    return !!localStorage.getItem(TOKEN_KEY) && !!getUsuarioActual();
}

// Llamadas a la API
/**
 * Envía credenciales al endpoint POST /auth/login.
 * El backend Node.js maneja: validación, intentos fallidos, bloqueo y bitácora.
 * En caso de éxito guarda el token y los datos del usuario.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    // auth: false -> no adjunta Bearer (no hay token aún)
    const response = await apiClient.post<LoginResponse, LoginCredentials>(
        '/auth/login',
        credentials,
        false
    );

    if (response.success && response.token) {
        guardarSesion(response.token, response.usuario);
    }

    return response;
}

/**
 * Cierra sesión: notifica al backend (para registro de bitácora)
 * y limpia el storage local.
 */
export async function logout(): Promise<void> {
    try {
        await apiClient.post('/auth/logout', {});
    } catch {
        // Si el backend falla, de igual manera limpiamos la sesión local
    } finally {
        limpiarSesion();
    }
}