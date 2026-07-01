import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';

export default function AdminLayout() {
  const location = useLocation();

  const getActiveMenu = (pathname) => {
    if (pathname.includes('/admin/dashboard')) return 'dashboard';
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/facilities')) return 'facilities';
    if (pathname.includes('/admin/payouts')) return 'payouts';
    if (pathname.includes('/admin/payment-settings')) return 'payment-settings';
    if (pathname.includes('/admin/revenue')) return 'revenue';
    if (pathname.includes('/admin/posts')) return 'posts';
    if (pathname.includes('/admin/system-settings')) return 'system-settings';
    if (pathname.includes('/admin/profile')) return 'profile';
    return 'dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 overflow-hidden">
      {/* Unified Core Sidebar */}
      <Sidebar activeMenu={getActiveMenu(location.pathname)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-[#0b0f19] border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-4 md:px-8">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-label hidden sm:inline">Trang Quản Trị</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-label sm:hidden">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-2 py-1 bg-emerald-500/10 dark:bg-primary/10 text-emerald-700 dark:text-primary rounded-lg uppercase tracking-wider font-label border border-emerald-500/20 dark:border-primary/20">
                Admin
              </span>
              <span className="text-xs sm:text-sm font-semibold font-label dark:text-white truncate max-w-[80px] sm:max-w-none">
                System
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <div key={location.pathname} className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-[#0e1322] animate-page relative overflow-hidden">
          <SportyWatermarks />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
