import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { apiUrl } from '../config/api';
import { useAdminData } from '../context/AdminContext';

export default function ColdStartBanner() {
  // Never show on standard web production builds
  const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
  const isMobileMode = import.meta.env.MODE === 'mobile';

  if (!isNative && !isMobileMode) {
    return null;
  }

  const { fetchProjects } = useAdminData();
  const [isWaking, setIsWaking] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const timeoutRef = useRef(null);

  const checkServerStatus = useCallback(async () => {
    setIsChecking(true);
    setHasError(false);
    setErrorMessage('');

    // If server takes longer than 3 seconds, show waking-up banner
    timeoutRef.current = setTimeout(() => {
      setIsWaking(true);
    }, 3000);

    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(apiUrl('/api/status'), {
        signal: controller.signal
      });
      clearTimeout(abortTimeout);
      clearTimeout(timeoutRef.current);

      if (res.ok) {
        setIsWaking(false);
        setHasError(false);
      } else {
        setIsWaking(false);
        setHasError(true);
        setErrorMessage(`Server responded with status ${res.status}`);
      }
    } catch (err) {
      clearTimeout(abortTimeout);
      clearTimeout(timeoutRef.current);
      setIsWaking(false);
      setHasError(true);
      setErrorMessage(
        err.name === 'AbortError'
          ? 'Cloud instance connection timed out.'
          : 'Unable to reach backend service.'
      );
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkServerStatus();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [checkServerStatus]);

  const handleRetry = async () => {
    // Re-check status AND reload core projects data
    await Promise.allSettled([
      checkServerStatus(),
      typeof fetchProjects === 'function' ? fetchProjects() : Promise.resolve()
    ]);
  };

  if (!isWaking && !hasError) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-2 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-[#1A1512] text-[#F0EBE1] border border-[#C1512F]/40 shadow-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 min-w-0">
          {isChecking ? (
            <Loader2 className="w-4 h-4 text-[#C1512F] animate-spin shrink-0" />
          ) : hasError ? (
            <AlertCircle className="w-4 h-4 text-[#C1512F] shrink-0" />
          ) : (
            <Loader2 className="w-4 h-4 text-[#C1512F] animate-spin shrink-0" />
          )}

          <div className="min-w-0">
            <div className="font-bold tracking-wider text-[11px] text-[#C1512F] uppercase">
              {hasError ? 'SERVER OFFLINE' : 'WAKING CLOUD INSTANCE'}
            </div>
            <div className="text-[10px] text-[#F0EBE1]/70 truncate">
              {hasError
                ? errorMessage || 'Connection failed'
                : 'Free tier spinning up (10-30s)...'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isChecking}
          className="px-2.5 py-1.5 bg-[#C1512F] hover:bg-[#A33D1F] text-white font-bold text-[10px] tracking-widest uppercase transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
          <span>RETRY</span>
        </button>
      </div>
    </div>
  );
}
