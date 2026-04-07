// Login Component

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { MsgParam } from '../types/auth';
import '../assets/login.css';

// ── Tipos internos
interface LoginProps {

    msg?: MsgParam;
    // Callback cuando el login es exitoso
    onLoginSuccess?: () => void;
}

interface FormState {
    Identificacion: string;
    Contrasena: string;
}

// Mensajes informativos

const INFO_MESSAGES: Record<NonNullable<MsgParam>, string> = {
    nosesion: 'Por favor inicie sesión para utilizar el sistema.',
    expirada: 'Su sesión ha expirado por inactividad. Por favor inicie sesión nuevamente.',
    logout: 'Ha cerrado sesión correctamente.',
};

// Componente de alerta con auto-cierre

interface AlertaProps {
    tipo: 'danger' | 'warning';
    mensaje: string;
    onClose: () => void;
}

function Alerta({ tipo, mensaje, onClose }: AlertaProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Auto-cierre a los 3 s (igual que el JS del PHP)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (ref.current) {
                ref.current.style.transition = 'opacity 500ms ease-out';
                ref.current.style.opacity = '0';
                setTimeout(onClose, 500);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icono = tipo === 'danger' ? 'fa-exclamation-triangle' : 'fa-info-circle';

    return (
        <div
            ref={ref}
            className={`alert alert-${tipo} alert-dismissible fade show`}
            role="alert"
        >
            <i className={`fas ${icono} mr-2`} />
            {mensaje}
            <button type="button" className="close" onClick={onClose} aria-label="Cerrar">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
}

// Componente principal

export default function Login({ msg, onLoginSuccess }: LoginProps) {
    const { login, isLoading, error, clearError } = useAuth();

    const [form, setForm] = useState<FormState>({
        Identificacion: '',
        Contrasena: '',
    });

    const [mostrarInfo, setMostrarInfo] = useState(true);
    const mensajeInfo = msg ? INFO_MESSAGES[msg] : null;

    // Limpia el error del hook al desmontar
    useEffect(() => () => clearError(), [clearError]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Si el usuario empieza a escribir, descarta el error anterior
        if (error) clearError();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const { Identificacion, Contrasena } = form;

        // Validación client-side (equivalente al if vacío del PHP)
        if (!Identificacion.trim() || !Contrasena.trim()) {
            return; // El atributo `required` del input ya muestra el error nativo
        }

        const success = await login({ Identificacion, Contrasena });
        if (success) {
            onLoginSuccess?.();
        }
    }

    return (
        <div className="login-box">

            {/* Cabecera */}
            <div className="login-header">
                <div className="login-logo">
                    <i className="fas fa-calculator rotate-n-15" />
                </div>
                <h2 className="mb-0">Sistema Contable</h2>
                <p className="mb-0 mt-2 company-name">Desarrollos Ordenados S.A.</p>
            </div>

            {/* Cuerpo */}
            <div className="login-body">

                {/* Alerta de error */}
                {error && (
                    <Alerta
                        tipo="danger"
                        mensaje={error}
                        onClose={clearError}
                    />
                )}

                {/* Alerta informativa (nosesion / expirada / logout) */}
                {mensajeInfo && mostrarInfo && (
                    <Alerta
                        tipo="warning"
                        mensaje={mensajeInfo}
                        onClose={() => setMostrarInfo(false)}
                    />
                )}

                <form onSubmit={handleSubmit} noValidate>

                    {/* Campo usuario */}
                    <div className="form-group">
                        <label htmlFor="Identificacion" className="font-weight-bold text-gray-700">
                            <i className="fas fa-user mr-1" /> Usuario
                        </label>
                        <input
                            type="text"
                            id="Identificacion"
                            name="Identificacion"
                            className="form-control form-control-lg"
                            placeholder="Ingrese su usuario"
                            value={form.Identificacion}
                            onChange={handleChange}
                            autoComplete="username"
                            autoFocus
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Campo contraseña */}
                    <div className="form-group mb-4">
                        <label htmlFor="Contrasena" className="font-weight-bold text-gray-700">
                            <i className="fas fa-lock mr-1" /> Contraseña
                        </label>
                        <input
                            type="password"
                            id="Contrasena"
                            name="Contrasena"
                            className="form-control form-control-lg"
                            placeholder="Ingrese su contraseña"
                            value={form.Contrasena}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        className="btn btn-login btn-lg btn-block"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm mr-2"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Ingresando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt mr-2" />
                                Ingresar
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}