/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { PATHS } from './paths';
import MainLayout from '../components/layout/MainLayout';

// High-performance dynamic code-splitting for feature modules
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const AboutPage = lazy(() => import('../features/about/pages/AboutPage'));

// Auth Features
const AuthLayout = lazy(() => import('../features/Auth/components/AuthLayout'));
const LoginPage = lazy(() => import('../features/Auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/Auth/pages/RegisterPage'));

// Groups Feature (Auth-Gated)
import ProtectedRoute from '../components/layout/ProtectedRoute';
const GroupsDashboard = lazy(() => import('../features/groups/pages/GroupsDashboard'));
const TeamManagementPage = lazy(() => import('../features/groups/pages/TeamManagementPage'));
const JoinGroupPage = lazy(() => import('../features/groups/pages/JoinGroupPage'));
const BookingsPage = lazy(() => import('../features/bookings/pages/BookingsPage'));
const SchedulesPage = lazy(() => import('../features/schedules/pages/SchedulesPage'));
const ProfilePage = lazy(() => import('../features/profiles/pages/ProfilePage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const CourtsManagementPage = lazy(() => import('../features/courtsManagement/pages/CourtsManagementPage'));

/**
 * Global Routing Registry
 * Using React Router modern browser router config, establishing nested layouts
 * and native lazy chunk split configurations.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: PATHS.ABOUT,
        element: <AboutPage />
      },
      {
        path: PATHS.MEMBERS,
        element: <Navigate to={PATHS.CONTACT} replace />
      },
      {
        path: PATHS.SHOP,
        element: <Navigate to={PATHS.COLLECTIONS} replace />
      },
      {
        path: PATHS.NOT_FOUND,
        element: <Navigate to={PATHS.HOME} replace />
      }
    ]
  },
  {
    path: PATHS.GROUPS,
    element: <ProtectedRoute><GroupsDashboard /></ProtectedRoute>
  },
  {
    path: PATHS.GROUP_MANAGE,
    element: <ProtectedRoute><TeamManagementPage /></ProtectedRoute>
  },
  {
    path: PATHS.GROUP_INVITE,
    element: <ProtectedRoute><JoinGroupPage /></ProtectedRoute>
  },
  {
    path: '/bookings',
    element: <ProtectedRoute><BookingsPage /></ProtectedRoute>
  },
  {
    path: PATHS.SCHEDULES,
    element: <ProtectedRoute><SchedulesPage /></ProtectedRoute>
  },
  {
    path: PATHS.PROFILE,
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
  },
  {
    path: PATHS.DASHBOARD,
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
  },
  {
    path: PATHS.COURTS_MANAGEMENT,
    element: <ProtectedRoute><CourtsManagementPage /></ProtectedRoute>
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: PATHS.LOGIN,
        element: <LoginPage />
      },
      {
        path: PATHS.REGISTER,
        element: <RegisterPage />
      }
    ]
  }
]);
