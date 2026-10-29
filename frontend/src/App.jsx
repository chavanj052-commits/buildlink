import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import MessagesPage from './pages/MessagesPage';
import {
  RoleDashboard,
  ProjectsPage,
  ProjectDetailPage,
  MaterialsPage,
  PaymentsPage,
  DocumentsPage,
  TeamPage,
} from './pages/RolePages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard & Module Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <Layout>
                <MaterialsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Layout>
                <PaymentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <Layout>
                <TeamPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Layout>
                <MessagesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
