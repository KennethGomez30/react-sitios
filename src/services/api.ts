// Cliente HTTP Base
// Apunta a la futura API Node.js. Cambia VITE_API_URL en .env para producción.
// Ejemplo .env.development:  VITE_API_URL=http://localhost:3000/api

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody = unknown> {
    method?: HttpMethod;
    body?: TBody;
    /** Si es false, no adjunta el Bearer token (ej. login) */
    auth?: boolean;
}

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    async request<TResponse, TBody = unknown>(
        endpoint: string,
        options: RequestOptions<TBody> = {}
    ): Promise<TResponse> {
        const { method = 'GET', body, auth = true } = options;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (auth) {
            const token = this.getToken();
            if (token) {
                (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        // La API Node.js debe retornar siempre JSON
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message: string =
                (data as { message?: string })?.message ??
                `Error ${response.status}: ${response.statusText}`;
            throw new Error(message);
        }

        return data as TResponse;
    }

    // Métodos de conveniencia

    get<TResponse>(endpoint: string, auth = true) {
        return this.request<TResponse>(endpoint, { method: 'GET', auth });
    }

    post<TResponse, TBody = unknown>(endpoint: string, body: TBody, auth = true) {
        return this.request<TResponse, TBody>(endpoint, { method: 'POST', body, auth });
    }

    put<TResponse, TBody = unknown>(endpoint: string, body: TBody, auth = true) {
        return this.request<TResponse, TBody>(endpoint, { method: 'PUT', body, auth });
    }

    delete<TResponse>(endpoint: string, auth = true) {
        return this.request<TResponse>(endpoint, { method: 'DELETE', auth });
    }
}

// Instancia singleton, importá esto en los services
export const apiClient = new ApiClient(BASE_URL);