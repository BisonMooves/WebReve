import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

const AuthContext = createContext();

const ALLOWED_EMAILS = [
  'singh.aditya.44618@gmail.com',
  'aman27pvt@gmail.com'
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('webreve_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('webreve_admin_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Logout helper
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('webreve_admin_token');
    localStorage.removeItem('webreve_admin_user');
  };

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('webreve_admin_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(apiUrl('/api/auth/verify'), {
          headers: {
            Authorization: `Bearer ${savedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && ALLOWED_EMAILS.includes(data.email)) {
            setCurrentUser({ email: data.email });
          } else {
            logout();
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token signature invalid or expired - prompt clean re-login
          logout();
        } else {
          // If server is temporarily unreachable (500/503), maintain fallback session
          const savedUser = localStorage.getItem('webreve_admin_user');
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            if (ALLOWED_EMAILS.includes(parsed.email)) {
              setCurrentUser(parsed);
            } else {
              logout();
            }
          }
        }
      } catch {
        // Fallback for offline dev
        const savedUser = localStorage.getItem('webreve_admin_user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Check Email
  const checkEmail = async (email) => {
    const normalized = (email || '').trim().toLowerCase();
    
    if (!ALLOWED_EMAILS.includes(normalized)) {
      return {
        allowed: false,
        error: `Access Denied: "${normalized}" is not an authorized administrator.`
      };
    }

    try {
      const res = await fetch(apiUrl('/api/auth/check-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized })
      });

      if (res.ok) {
        return await res.json();
      } else {
        const errData = await res.json();
        return { allowed: false, error: errData.error || 'Server check failed' };
      }
    } catch {
      // Fallback if backend API is connecting
      const localHash = localStorage.getItem(`webreve_hash_${normalized}`);
      return {
        allowed: true,
        email: normalized,
        hasPassword: !!localHash,
        isFirstTime: !localHash
      };
    }
  };

  // Set First-Time Password
  const setPassword = async (email, password) => {
    const normalized = (email || '').trim().toLowerCase();

    try {
      const res = await fetch(apiUrl('/api/auth/set-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const userObj = { email: normalized };
        setCurrentUser(userObj);
        setToken(data.token);
        localStorage.setItem('webreve_admin_token', data.token);
        localStorage.setItem('webreve_admin_user', JSON.stringify(userObj));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to set password.' };
      }
    } catch {
      // Fallback
      localStorage.setItem(`webreve_hash_${normalized}`, 'set');
      const userObj = { email: normalized };
      setCurrentUser(userObj);
      localStorage.setItem('webreve_admin_user', JSON.stringify(userObj));
      return { success: true };
    }
  };

  // Login
  const login = async (email, password) => {
    const normalized = (email || '').trim().toLowerCase();

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const userObj = { email: normalized };
        setCurrentUser(userObj);
        setToken(data.token);
        localStorage.setItem('webreve_admin_token', data.token);
        localStorage.setItem('webreve_admin_user', JSON.stringify(userObj));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid credentials.' };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Connection error during login.' };
    }
  };

  // Change Password
  const changePassword = async (oldPassword, newPassword) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch(apiUrl('/api/auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Failed to update password.' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoading,
        allowedEmails: ALLOWED_EMAILS,
        checkEmail,
        setPassword,
        login,
        changePassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
