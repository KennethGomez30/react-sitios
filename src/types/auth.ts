// Tipos de Autenticación

export interface LoginCredentials {
    Identificacion: string;
    Contrasena: string;
}

export interface Usuario {
    Identificacion: string;
    Nombre: string;
    Apellido: string;
    Correo: string;
    Estado: 'Activo' | 'Bloqueado' | 'Inactivo';
    Roles: string[];
}

export interface LoginResponse {
    success: boolean;
    token: string;
    usuario: Usuario;
    message?: string;
}

export interface ApiError {
    message: string;
    code?: string;
}

// Mensajes de info según query param (equivalente al ?msg= del PHP)
export type MsgParam = 'nosesion' | 'expirada' | 'logout' | null;