import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../auth/useAuthStore';

export interface ValidationErrorItem {
  propertyName?: string;
  PropertyName?: string;
  message?: string;
  Message?: string;
  [key: string]: unknown;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: ValidationErrorItem[] | Record<string, string[] | string>;
  invalidParams?: Array<{
    propertyName?: string;
    name?: string;
    reason?: string;
    errorMessage?: string;
    message?: string;
  }>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public status?: number;
  public problemDetails?: ProblemDetails;
  public fieldErrors: Record<string, string>;

  constructor(
    message: string,
    status?: number,
    problemDetails?: ProblemDetails,
    fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problemDetails = problemDetails;
    this.fieldErrors = fieldErrors;
  }
}

export function parseProblemDetails(data: ProblemDetails | undefined): {
  message: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  const messages: string[] = [];

  if (!data) {
    return { message: 'Error de comunicación con el servidor', fieldErrors };
  }

  // 1. Process "errors" property
  if (Array.isArray(data.errors)) {
    for (const item of data.errors) {
      const prop = item.propertyName || item.PropertyName || '';
      const msg = item.message || item.Message || '';
      if (msg) {
        messages.push(msg);
        if (prop) {
          const normalizedKey = prop.charAt(0).toLowerCase() + prop.slice(1);
          fieldErrors[normalizedKey] = msg;
          fieldErrors[prop] = msg;
        }
      }
    }
  } else if (data.errors && typeof data.errors === 'object') {
    for (const [key, val] of Object.entries(data.errors)) {
      const msgList = Array.isArray(val) ? val : [val];
      const joined = msgList.filter(Boolean).join('. ');
      if (joined) {
        messages.push(joined);
        const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
        fieldErrors[normalizedKey] = joined;
        fieldErrors[key] = joined;
      }
    }
  }

  // 2. Process "invalidParams" property
  if (Array.isArray(data.invalidParams)) {
    for (const item of data.invalidParams) {
      const prop = item.propertyName || item.name || '';
      const msg = item.errorMessage || item.reason || item.message || '';
      if (msg) {
        messages.push(msg);
        if (prop) {
          const normalizedKey = prop.charAt(0).toLowerCase() + prop.slice(1);
          fieldErrors[normalizedKey] = msg;
          fieldErrors[prop] = msg;
        }
      }
    }
  }

  // 3. Determine final message
  let finalMessage = '';
  if (messages.length > 0) {
    finalMessage = Array.from(new Set(messages)).join('\n');
  } else if (data.detail && !data.detail.includes('Se encontraron uno o más errores de validación')) {
    finalMessage = data.detail;
  } else if (data.title && !data.title.includes('Error en los datos de entrada')) {
    finalMessage = data.title;
  } else if (data.detail) {
    finalMessage = data.detail;
  } else if (data.title) {
    finalMessage = data.title;
  } else {
    finalMessage = 'Error de validación en la solicitud';
  }

  return { message: finalMessage, fieldErrors };
}

export function getErrorMessage(error: unknown, defaultMessage = 'Ha ocurrido un error inesperado'): string {
  if (error instanceof ApiError) {
    return error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  if (typeof error === 'string') {
    return error;
  }
  return defaultMessage;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject Bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const rawTokens = localStorage.getItem('tokens');
    if (rawTokens) {
      try {
        const parsed = JSON.parse(rawTokens);
        const token = parsed?.accessToken || parsed?.token || (typeof parsed === 'string' ? parsed : null);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        config.headers.Authorization = `Bearer ${rawTokens}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Map ProblemDetails & handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    if (error.response?.status === 401) {
      try {
        const authStore = useAuthStore();
        authStore.logout();
      } catch {
        localStorage.removeItem('tokens');
      }

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }

      return Promise.reject(
        new ApiError('Su sesión ha expirado. Por favor ingrese nuevamente.', 401)
      );
    }

    if (error.response?.data) {
      const data = error.response.data;
      const { message, fieldErrors } = parseProblemDetails(data);
      return Promise.reject(new ApiError(message, error.response.status, data, fieldErrors));
    }

    return Promise.reject(
      new ApiError(error.message || 'Error de conexión con el servidor', error.response?.status)
    );
  }
);

export default apiClient;
