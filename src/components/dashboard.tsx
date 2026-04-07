// Placeholder del dashboard. Reemplázalo con tu implementación real.

import { useAuth } from '../hooks/useAuth';

interface DashboardProps {
    onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const { usuario } = useAuth();

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Bienvenido, {usuario?.Nombre} {usuario?.Apellido}</h1>
            <p>Roles: {usuario?.Roles.join(', ')}</p>
            <button className="btn btn-danger" onClick={onLogout}>
                Cerrar sesión
            </button>
        </div>
    );
}