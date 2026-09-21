import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useModalRegistry } from '../context/ModalContext';

export default function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { closeTopmostModal } = useModalRegistry();

  // Use refs to prevent stale closures in the single Capacitor listener
  const locationRef = useRef(location);
  const closeTopmostModalRef = useRef(closeTopmostModal);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    closeTopmostModalRef.current = closeTopmostModal;
  }, [closeTopmostModal]);

  useEffect(() => {
    // Only register hardware back button listener on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let backListenerHandle = null;

    const setupBackListener = async () => {
      backListenerHandle = await CapApp.addListener('backButton', ({ canGoBack }) => {
        // 1. If any modal or drawer is currently open, close it first
        if (closeTopmostModalRef.current && closeTopmostModalRef.current()) {
          return;
        }

        const currentPath = locationRef.current ? locationRef.current.pathname : '/';

        // 2. If at root ('/'), exit the app immediately (don't loop through hash anchors like #work)
        if (currentPath === '/' || currentPath === '') {
          CapApp.exitApp();
          return;
        }

        // 3. If there is history to go back to, navigate back
        if (canGoBack) {
          navigate(-1);
          return;
        }

        // 4. Fallback for direct landing on deep route (/project/:id, /admin): return to home
        navigate('/', { replace: true });
      });
    };

    setupBackListener();

    return () => {
      if (backListenerHandle && typeof backListenerHandle.remove === 'function') {
        backListenerHandle.remove();
      }
    };
  }, [navigate]);

  return null;
}
