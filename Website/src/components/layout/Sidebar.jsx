import { useNavigate, useLocation } from 'react-router-dom';
import {
  Flame,
  Plus,
  LayoutDashboard,
  Users,
  CalendarDays,
  DollarSign,
  UserCircle,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGetUserId } from '../../features/Auth/hooks/useAuth';

export default function Sidebar({ onCreateGroup, activeMenu = 'teams' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const { user, isLoading } = useGetUserId();
  
  // Role from API response (primary) or JWT-decoded localStorage (fallback)
  const roleName = user?.data?.roleName || localStorage.getItem('roleName');
  const isFacilityOwner = roleName === 'FacilityOwner';

  const sidebarItems = isFacilityOwner ? [
    { id: 'dashboard', label: 'Bảng thống kê', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'courts-management', label: 'Quản lý sân', icon: Settings, path: '/courts-management' },
    { id: 'profile', label: 'Cá nhân', icon: UserCircle, path: '/profile' },
  ] : [
    { id: 'dashboard', label: 'Bảng thống kê', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'teams', label: 'Quản lý Nhóm', icon: Users, path: '/groups' },
    { id: 'bookings', label: 'Đặt sân', icon: CalendarDays, path: '/bookings' },
    { id: 'sessions', label: 'Lịch chơi', icon: CalendarDays, path: '/schedules' },
    { id: 'profile', label: 'Cá nhân', icon: UserCircle, path: '/profile' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0d1117]/90 border-r border-gray-200 dark:border-border-dark flex flex-col justify-between h-screen sticky top-0 shrink-0 transition-colors duration-300">
      <div className="flex flex-col">
        {/* Back to Home Navigation Element */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-4 text-xs font-bold text-emerald-700 dark:text-primary hover:text-emerald-800 dark:hover:text-primary-dark border-b border-gray-100 dark:border-border-dark/40 transition-colors font-label cursor-pointer text-left w-full"
        >
          <span>← Quay về Trang chủ</span>
        </button>

        {/* Club/Group Profile Section */}
        <div className="p-5 border-b border-gray-200 dark:border-border-dark/60 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-primary/10 border border-emerald-500/20 dark:border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
              <Flame className="h-5 w-5 text-emerald-600 dark:text-primary animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-gray-900 dark:text-white font-extrabold text-sm truncate font-display leading-tight">
                SmashClub
              </h3>
              <p className="text-[10px] text-emerald-700 dark:text-primary/70 font-bold uppercase tracking-wider font-label mt-0.5">
                Quản lý Nhóm
              </p>
            </div>
          </div>

          {/* User Info Badge */}
          {isLoading ? (
            <div className="h-10 w-full bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ) : user?.data?.fullName && (
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-white/5 border border-emerald-100/50 dark:border-white/10 shadow-sm transition-colors hover:bg-emerald-50 dark:hover:bg-white/10">
              <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-primary/20 flex items-center justify-center shrink-0">
                <UserCircle className="w-4 h-4 text-emerald-600 dark:text-primary" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider font-label leading-none mb-1">
                  Tài Khoản Của:
                </p>
                <p className="text-xs text-gray-900 dark:text-white font-bold font-label break-words leading-snug">
                  {user.data.fullName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* "+ New Session/Team" Button */}
        {!isFacilityOwner && (
          <div className="px-4 py-4">
            <button
              onClick={() => onCreateGroup && onCreateGroup()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary-dark text-white dark:text-[#052e14] transition-all duration-200 shadow-md shadow-emerald-500/10 dark:shadow-primary/10 hover:-translate-y-0.5 font-label cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              Tạo Nhóm Mới
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1 mt-1">
          {sidebarItems.map((item) => {
            const isActive = activeMenu === item.id || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => item.path && navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 font-label cursor-pointer ${isActive
                  ? 'text-emerald-800 bg-emerald-50/70 border-l-4 border-emerald-600 dark:text-primary dark:bg-primary/5 dark:border-emerald-500'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
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

      {/* Theme & Settings Section at Bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-border-dark/60 space-y-1 bg-gray-50/50 dark:bg-transparent">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-all font-label cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isDarkMode ? <Moon className="h-4 w-4 text-emerald-500" /> : <Sun className="h-4 w-4 text-amber-500" />}
            Theme
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-gray-400">
            {isDarkMode ? 'Tối' : 'Sáng'}
          </span>
        </button>

        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-all font-label cursor-pointer">
          <Settings className="h-4 w-4 text-gray-400" />
          Cài đặt
        </button>
      </div>
    </aside>
  );
}
