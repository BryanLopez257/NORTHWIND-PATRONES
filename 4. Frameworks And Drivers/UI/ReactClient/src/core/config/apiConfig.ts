/**
 * Configuración dinámica y persistente de la API NorthWind WebApi
 * Equivalente a `ApiConfig` en Flutter.
 */
const STORAGE_KEY = 'nw_web_api_url';
export const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type Listener = (newUrl: string) => void;
const listeners: Listener[] = [];

export class ApiConfig {
  private static _currentBaseUrl: string = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        return saved.trim().replace(/\/+$/, '');
      }
    } catch {
      // Fallback
    }
    return DEFAULT_API_URL.replace(/\/+$/, '');
  })();

  static get baseUrl(): string {
    return this._currentBaseUrl;
  }

  static setBaseUrl(url: string): void {
    let clean = url.trim();
    if (clean.endsWith('/')) {
      clean = clean.replace(/\/+$/, '');
    }
    if (!clean) {
      clean = DEFAULT_API_URL;
    }
    this._currentBaseUrl = clean;
    try {
      localStorage.setItem(STORAGE_KEY, clean);
    } catch (e) {
      console.error('Error guardando API URL en localStorage:', e);
    }
    listeners.forEach((fn) => fn(clean));
  }

  static resetToDefault(): void {
    const cleanDefault = DEFAULT_API_URL.replace(/\/+$/, '');
    this._currentBaseUrl = cleanDefault;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error limpiando API URL en localStorage:', e);
    }
    listeners.forEach((fn) => fn(cleanDefault));
  }

  static subscribe(fn: Listener): () => void {
    listeners.push(fn);
    return () => {
      const index = listeners.indexOf(fn);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
}
