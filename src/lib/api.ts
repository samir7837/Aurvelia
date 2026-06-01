export const API_BASE_URL = import.meta.env.PROD
  ? 'https://aurvelia-backend.onrender.com'
  : 'http://localhost:4000';

export function apiUrl(path: string) {
  if (!path) return API_BASE_URL;
  return path.startsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
}
