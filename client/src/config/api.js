// API Configuration Helper for WebRêve Client
// Supports custom VITE_API_URL, native Capacitor platform detection, and deployed backend fallback.
import { Capacitor } from '@capacitor/core';

const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
const isMobileMode = import.meta.env.MODE === 'mobile';

let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

// On native Capacitor or mobile mode, always point to VITE_API_URL or production backend
if (isNative || isMobileMode) {
  if (!rawApiUrl) {
    rawApiUrl = 'https://webreve-server.onrender.com';
  }
} else {
  // Web-only hostname detection and Render Blueprint handling
  if (rawApiUrl && !rawApiUrl.includes('.') && !rawApiUrl.includes('localhost') && !rawApiUrl.includes(':')) {
    rawApiUrl = `${rawApiUrl}.onrender.com`;
  }

  // Fallback when hosted on Render without explicit API URL
  if (!rawApiUrl && typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    rawApiUrl = window.location.hostname.replace('webreve-client', 'webreve-server');
  }
}

export const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://') ? rawApiUrl : `https://${rawApiUrl}`)
  : '';

/**
 * Resolve an API endpoint to an absolute URL on native or relative on web
 */
export function apiUrl(endpoint) {
  if (!endpoint) return '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Display-only image resolver: passes through data:, blob:, http(s), and /assets/
 * and prepends API_BASE_URL only for relative /api/images endpoints.
 * Never mutates data saved to the database.
 */
export function resolveImageUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }
  // Bundled Vite local assets
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('assets/')) {
    return trimmed;
  }
  // Relative API routes (e.g. /api/images/:id)
  return apiUrl(trimmed);
}

export default {
  API_BASE_URL,
  apiUrl,
  resolveImageUrl
};
