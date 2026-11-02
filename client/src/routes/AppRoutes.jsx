import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import LeadsListPage from '../pages/leads/LeadsListPage';
import CompaniesListPage from '../pages/companies/CompaniesListPage';
import CompanyDetailPage from '../pages/companies/CompanyDetailPage';
import TasksListPage from '../pages/tasks/TasksListPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected CRM routes wrapped in AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="leads" element={<LeadsListPage />} />
        <Route path="companies" element={<CompaniesListPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="tasks" element={<TasksListPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
