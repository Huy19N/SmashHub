import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  UserCircle,
  LogOut,
  Moon,
  Sun,
  Flame
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLogout } from '../../Auth/hooks/useAuth';
import { PATHS } from '../../../routes/paths';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();
    navigate(PATHS.LOGIN);
  };

  const adminMenuItems = [
    { id: 'dashboard', label: 'Bảng thống kê', shortLabel: 'Thống kê', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'users', label: 'Quản lý User', shortLabel: 'User', icon: Users, path: '/admin/users' },
    { id: 'facilities', label: 'Quản lý Chủ sân', shortLabel: 'Chủ sân', icon: Building2, path: '/admin/facilities' },
    { id: 'payouts', label: 'Yêu cầu rút tiền', shortLabel: 'Rút tiền', icon: Wallet, path: '/admin/payouts' },
    { id: 'profile', label: 'Cá nhân', shortLabel: 'Cá nhân', icon: UserCircle, path: '/admin/profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-[#0b0f19]/90 border-r border-gray-100 dark:border-white/5 flex flex-col justify-between h-screen shrink-0 transition-colors duration-300">
        <div className="flex flex-col">
          {/* Back to Home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-4 text-xs font-bold text-emerald-600 dark:text-primary hover:text-emerald-700 dark:hover:text-primary-dark border-b border-gray-100 dark:border-white/5 transition-colors font-label cursor-pointer text-left w-full active:scale-[0.98]"
          >
            <span>← Quay về Trang chủ</span>
          </button>

          {/* Logo & Platform Info */}
          <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-primary/10 border border-emerald-500/20 dark:border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                <Flame className="h-5 w-5 text-emerald-600 dark:text-primary animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-gray-900 dark:text-white font-extrabold text-sm truncate font-display leading-tight">
                  SmashHub Admin
                </h3>
                <p className="text-[10px] text-emerald-600 dark:text-primary/70 font-bold uppercase tracking-wider font-label mt-0.5">
                  Hệ thống Quản trị
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 space-y-1.5 mt-5">
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 font-label cursor-pointer active:scale-95 border ${isActive
                    ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-primary dark:bg-primary/10 dark:border-primary/20 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-transparent dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                >
                  <item.icon
                    className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-primary' : 'text-gray-400 dark:text-gray-500'
                      }`}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Theme Settings & Logout */}
        <div className="p-4 border-t border-gray-150 dark:border-white/5 space-y-1.5 bg-gray-50/20 dark:bg-transparent">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-all font-label cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {isDarkMode ? <Moon className="h-4 w-4 text-emerald-500 animate-pulse" /> : <Sun className="h-4 w-4 text-amber-500" />}
              Chế độ tối
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {isDarkMode ? 'Bật' : 'Tắt'}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-label cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 flex justify-around items-center h-16 py-1 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors duration-300">
        {adminMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <div className={`flex flex-col items-center justify-center w-full max-w-[68px] py-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 dark:bg-primary/10 text-emerald-700 dark:text-primary font-bold scale-[1.03]'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}>
                <item.icon className="h-5 w-5" />
                <span className="text-[9px] font-bold font-label mt-1 truncate w-full text-center">
                  {item.shortLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-[#0e1322]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
