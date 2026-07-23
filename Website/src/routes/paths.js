/**
 * Centralized Route Paths definition
 * Used as the single source of truth for route navigation across the application.
 */
export const PATHS = {
  HOME: '/',
  CONTACT: '/contact',
  PREMIUM: '/premium',
  COLLECTIONS: '/collections',
  DASHBOARD: '/dashboard',
  MEMBERS: '/members',
  SHOP: '/shop',
  SCHEDULES: '/schedules',
  SOCIAL: '/social',
  GROUPS: '/groups',
  GROUP_MANAGE: '/groups/:teamId/manage',
  GROUP_INVITE: '/groups/invite/:token',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  COURTS_MANAGEMENT: '/courts-management',
  PAYMENT_MANAGEMENT: '/payment-management',
  PAYMENT_HISTORY: '/payment-history',
  PAYMENT_RESULT: '/payment-result',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_FACILITIES: '/admin/facilities',
  ADMIN_PAYOUTS: '/admin/payouts',
  ADMIN_FEEDBACK: '/admin/feedback',
  ADMIN_PROFILE: '/admin/profile',
  PRIVACY: '/privacy-policy',
  NOT_FOUND: '*',
};
