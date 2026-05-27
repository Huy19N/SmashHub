/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { PATHS } from './paths';
import MainLayout from '../components/layout/MainLayout';

// High-performance dynamic code-splitting for feature modules
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const AboutPage = lazy(() => import('../features/about/pages/AboutPage'));
const ContactPage = lazy(() => import('../features/contact/pages/ContactPage'));
const PremiumPage = lazy(() => import('../features/premium/pages/PremiumPage'));
const CollectionsPage = lazy(() => import('../features/collections/pages/CollectionsPage'));

// Auth Features
const AuthLayout = lazy(() => import('../features/Auth/components/AuthLayout'));
const LoginPage = lazy(() => import('../features/Auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/Auth/pages/RegisterPage'));

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
        path: PATHS.CONTACT,
        element: <ContactPage />
      },
      {
        path: PATHS.PREMIUM,
        element: <PremiumPage />
      },
      {
        path: PATHS.COLLECTIONS,
        element: <CollectionsPage />
      },
      // Keep legacy routes resolving to their new counterparts if accessed
      {
        path: PATHS.DASHBOARD,
        element: <Navigate to={PATHS.ABOUT} replace />
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
