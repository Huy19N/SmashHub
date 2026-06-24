/**
 * Centralized Route Paths definition
 * Used as the single source of truth for route navigation across the application.
 */
export const PATHS = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PREMIUM: '/premium',
  COLLECTIONS: '/collections',
  DASHBOARD: '/dashboard',
  MEMBERS: '/members',
  SHOP: '/shop',
  SCHEDULES: '/schedules',
  GROUPS: '/groups',
  GROUP_MANAGE: '/groups/:teamId/manage',
  GROUP_INVITE: '/groups/invite/:token',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  COURTS_MANAGEMENT: '/courts-management',
  PAYMENT_MANAGEMENT: '/payment-management',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_FACILITIES: '/admin/facilities',
  ADMIN_PAYOUTS: '/admin/payouts',
  ADMIN_PROFILE: '/admin/profile',
  NOT_FOUND: '*',
};
