import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
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
      </AdminProvider>
    </AuthProvider>
  );
}
