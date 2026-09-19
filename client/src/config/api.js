// API Configuration Helper for WebRêve Client
// Supports custom VITE_API_URL when frontend and backend are hosted on separate domains.
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

export const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://') ? rawApiUrl : `https://${rawApiUrl}`)
  : '';

export function apiUrl(endpoint) {
  if (!endpoint) return '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export default {
  API_BASE_URL,
  apiUrl
};
