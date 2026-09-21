import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ModalProvider } from './context/ModalContext';
import BackButtonHandler from './components/BackButtonHandler';
import ColdStartBanner from './components/ColdStartBanner';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

export default function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setStyle({ style: Style.Light });
        StatusBar.setBackgroundColor({ color: '#F0EBE1' });
      } catch (err) {
        console.warn('StatusBar init notice:', err);
      }
    }
  }, []);
  return (
    <AuthProvider>
      <AdminProvider>
        <ModalProvider>
          <BrowserRouter>
            {/* Native Android Hardware Back Navigation */}
            <BackButtonHandler />

            {/* Native Cold-Start Wake-up Banner for Sleeping Render Instances */}
            <ColdStartBanner />

            <Routes>
              {/* Main Public Website */}
              <Route path="/" element={<HomePage />} />

              {/* Dedicated Project Case Study Routes */}
              <Route path="/project/:id" element={<ProjectDetailPage />} />
              <Route path="/work/:id" element={<ProjectDetailPage />} />

              {/* Admin Suite Dashboard */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/*" element={<AdminPage />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ModalProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
