// API Configuration Helper for WebRêve Client
// Supports custom VITE_API_URL when frontend and backend are hosted on separate domains.
let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

// Fix Render Blueprint private hostnames (e.g., "webreve-server" -> "webreve-server.onrender.com")
if (rawApiUrl && !rawApiUrl.includes('.') && !rawApiUrl.includes('localhost') && !rawApiUrl.includes(':')) {
  rawApiUrl = `${rawApiUrl}.onrender.com`;
}

// Fallback when hosted on Render without explicit API URL
if (!rawApiUrl && typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
  rawApiUrl = window.location.hostname.replace('webreve-client', 'webreve-server');
}

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
