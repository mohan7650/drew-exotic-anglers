import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSpinner from './AdminSpinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <AdminSpinner />;
  if (!user) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
