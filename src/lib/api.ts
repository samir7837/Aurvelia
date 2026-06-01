export const API_BASE_URL = import.meta.env.PROD
  ? 'https://aurvelia-backend.onrender.com'
  : 'http://localhost:4000';

export function apiUrl(path: string) {
  if (!path) return API_BASE_URL;
  return path.startsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
}

export async function apiFetch(path: string, opts?: RequestInit) {
  const url = apiUrl(path);
  try {
    console.log('API URL:', url);
  } catch (e) {
    // noop
  }
  const res = await fetch(url, opts);
  try {
    const data = await res.clone().json();
    console.log('Response:', data);
  } catch (err) {
    console.log('Response: <non-json or parse error>');
  }
  return res;
}
