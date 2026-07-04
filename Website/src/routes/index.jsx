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
const SubscriptionPackages = lazy(() => import('../features/profiles/pages/SubscriptionPackages'));
const PaymentHistoryPage = lazy(() => import('../features/payments/pages/PaymentHistoryPage'));
const PaymentResultPage = lazy(() => import('../features/payments/pages/PaymentResultPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const CourtsManagementPage = lazy(() => import('../features/courtsManagement/pages/CourtsManagementPage'));
const PaymentManagementPage = lazy(() => import('../features/courtsManagement/pages/PaymentManagementPage'));
const MatchmakingPage = lazy(() => import('../features/groups/pages/MatchmakingPage'));
const SocialPage = lazy(() => import('../features/social/pages/SocialPage'));
const SinglePostPage = lazy(() => import('../features/social/pages/SinglePostPage'));
const CommunityStandardsPage = lazy(() => import('../features/social/pages/CommunityStandardsPage'));

// Admin Features
const AdminLayout = lazy(() => import('../features/admin/components/AdminLayout'));
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboard'));
const UserManagement = lazy(() => import('../features/admin/pages/UserManagement'));
const AdminFacilities = lazy(() => import('../features/admin/pages/FacilityManagement'));
const AdminSettings = lazy(() => import('../features/admin/pages/AdminSettings'));
const PaymentSettings = lazy(() => import('../features/admin/pages/PaymentSettings'));
const PayoutManagement = lazy(() => import('../features/admin/pages/PayoutManagement'));
const AdminProfile = lazy(() => import('../features/admin/pages/AdminProfile'));
const RevenueManagement = lazy(() => import('../features/admin/pages/RevenueManagement'));
const PostManagement = lazy(() => import('../features/admin/pages/PostManagement'));
const ReportManagement = lazy(() => import('../features/admin/pages/ReportManagement'));

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
    path: '/matchmaking',
    element: <ProtectedRoute><MatchmakingPage /></ProtectedRoute>
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
    path: PATHS.SOCIAL,
    element: <ProtectedRoute><SocialPage /></ProtectedRoute>
  },
  {
    path: '/social/post/:postId',
    element: <ProtectedRoute><SinglePostPage /></ProtectedRoute>
  },
  {
    path: '/community-standards',
    element: <CommunityStandardsPage />
  },
  {
    path: '/subscriptions',
    element: <ProtectedRoute><SubscriptionPackages /></ProtectedRoute>
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
    path: PATHS.PAYMENT_MANAGEMENT,
    element: <ProtectedRoute><PaymentManagementPage /></ProtectedRoute>
  },
  {
    path: PATHS.PAYMENT_HISTORY,
    element: <ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>
  },
  {
    path: PATHS.PAYMENT_RESULT,
    element: <PaymentResultPage />
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'facilities', element: <AdminFacilities /> },
      { path: 'payouts', element: <PayoutManagement /> },
      { path: 'revenue', element: <RevenueManagement /> },
      { path: 'posts', element: <PostManagement /> },
      { path: 'reports', element: <ReportManagement /> },
      { path: 'system-settings', element: <AdminSettings /> },
      { path: 'payment-settings', element: <PaymentSettings /> },
      { path: 'profile', element: <AdminProfile /> },
      { index: true, element: <Navigate to="dashboard" replace /> }
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
