import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Flame,
  Home,
  Users,
  Mail,
  Crown,
  Layers,
  Menu,
  X,
  Bell,
  ArrowRight,
  LogOut,
  UsersRound,
} from 'lucide-react';
import { PATHS } from '../../routes/paths';
import useAuth, { useGetUserId } from '../../features/Auth/hooks/useAuth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const avatarDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { user: apiUser } = useGetUserId();
  const isAuthenticated = !!user;
  const avatarInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const roleId = apiUser?.data?.roleId?.toString() || user?.roleId || localStorage.getItem('roleId');
  const isFacilityOwner = roleId === '3';
  const isAdmin = roleId === '1';

  const isHomePage = location.pathname === PATHS.HOME;

  useEffect(() => {
    if (!isHomePage) return; // Only need scroll detection on homepage for transparency

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAvatarDropdownOpen(false);
  }, [location.pathname]);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAvatarDropdownOpen(false);
    navigate(PATHS.LOGIN);
  };

  const navItems = [
    { name: 'Trang chủ', path: PATHS.HOME, icon: Home },
    { name: 'Giới thiệu', path: PATHS.ABOUT, icon: Users },
    { name: 'Liên hệ', path: PATHS.CONTACT, icon: Mail },
    { name: 'Hội viên', path: PATHS.PREMIUM, icon: Crown },
    { name: 'Bộ sưu tập', path: PATHS.COLLECTIONS, icon: Layers },
  ];

  // Logic to determine background styling
  // If on HomePage and NOT scrolled, it's transparent.
  // Otherwise, it's the solid glass-panel.
  const headerClasses = isHomePage
    ? `fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-lg py-4' : 'bg-transparent py-6'}`
    : `sticky top-0 z-50 bg-white dark:bg-[#0b0f19]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 py-3 shadow-lg font-label w-full transition-all duration-300`;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={PATHS.HOME} className="flex items-center gap-2 group">
            <div className="bg-emerald-500/10 dark:bg-primary/20 p-2 rounded-lg border border-emerald-500/20 dark:border-primary/30 group-hover:border-emerald-500 dark:group-hover:border-primary group-hover:bg-emerald-500/20 dark:group-hover:bg-primary/30 transition-all duration-300">
              <Flame className="h-5 w-5 text-emerald-600 dark:text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
              SMASH<span className="text-emerald-600 dark:text-primary font-black">HUB</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={(e) => {
                  if (item.path === PATHS.COLLECTIONS && isHomePage) {
                    e.preventDefault();
                    document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (item.path === PATHS.PREMIUM && isHomePage) {
                    e.preventDefault();
                    document.getElementById('premium-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (item.path === PATHS.CONTACT && isHomePage) {
                    e.preventDefault();
                    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={({ isActive }) => `
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                  ${isActive
                    ? 'bg-emerald-500/10 dark:bg-primary/10 text-emerald-700 dark:text-primary border border-emerald-500/20 dark:border-primary/20'
                    : 'text-slate-800 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-white hover:bg-emerald-500/5 dark:hover:bg-white/5 border border-transparent'}
                `}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                {/* Avatar with Dropdown */}
                <div className="relative" ref={avatarDropdownRef}>
                  <div
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    title={user?.name || 'Account'}
                    className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-lg shadow-md ring-2 ring-emerald-500/30 cursor-pointer hover:scale-105 transition-transform"
                  >
                    {avatarInitials}
                  </div>
                  {/* Dropdown Menu */}
                  {avatarDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl shadow-xl overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{isAdmin ? 'Quản trị viên SmashHub' : isFacilityOwner ? 'Chủ sân SmashHub' : 'Hội viên SmashHub'}</p>
                      </div>
                      <div className="py-1">
                        {isAdmin ? (
                          <button
                            onClick={() => { setAvatarDropdownOpen(false); navigate(PATHS.ADMIN_DASHBOARD); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-emerald-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors font-label cursor-pointer"
                          >
                            <Layers className="h-4 w-4 text-emerald-600 dark:text-primary" />
                            Trang quản trị
                          </button>
                        ) : isFacilityOwner ? (
                          <button
                            onClick={() => { setAvatarDropdownOpen(false); navigate(PATHS.COURTS_MANAGEMENT); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-emerald-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors font-label cursor-pointer"
                          >
                            <Layers className="h-4 w-4 text-emerald-600 dark:text-primary" />
                            Quản lý sân
                          </button>
                        ) : (
                          <button
                            onClick={() => { setAvatarDropdownOpen(false); navigate(PATHS.GROUPS); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-emerald-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors font-label cursor-pointer"
                          >
                            <UsersRound className="h-4 w-4 text-emerald-600 dark:text-primary" />
                            Nhóm của tôi
                          </button>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/5 transition-colors font-label cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to={PATHS.LOGIN}
                className="inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-bold bg-emerald-500 hover:bg-emerald-600 dark:bg-primary dark:hover:bg-primary-dark text-[#052e14] dark:text-white transition-all duration-300 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 cursor-pointer font-label"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <button className="p-2 text-slate-800 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-white rounded-lg hover:bg-emerald-500/5 dark:hover:bg-white/5 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-800 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-white hover:bg-emerald-500/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl animate-fade-in absolute w-full left-0 top-full shadow-2xl">
          <nav className="px-3 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={(e) => {
                  if (item.path === PATHS.COLLECTIONS && isHomePage) {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else if (item.path === PATHS.PREMIUM && isHomePage) {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('premium-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else if (item.path === PATHS.CONTACT && isHomePage) {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                {item.name}
              </NavLink>
            ))}

            {!isAuthenticated && (
              <div className="pt-4 px-2">
                <Link
                  to={PATHS.LOGIN}
                  className="flex justify-center items-center gap-2 w-full py-3 rounded-lg text-base font-bold bg-primary text-[#052e14]"
                >
                  Đăng nhập
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-4 pb-2 border-t border-white/10 mt-4 px-2 space-y-2">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-lg shadow-md ring-2 ring-emerald-500/30">
                    {avatarInitials}
                  </div>
                  <div>
                    <div className="text-gray-900 dark:text-white font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {isAdmin ? 'Quản trị viên SmashHub' : isFacilityOwner ? 'Chủ sân SmashHub' : 'Hội viên SmashHub'}
                    </div>
                  </div>
                </div>
                {isAdmin ? (
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate(PATHS.ADMIN_DASHBOARD); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-label cursor-pointer"
                  >
                    <Layers className="h-4 w-4 text-primary" />
                    Trang quản trị
                  </button>
                ) : isFacilityOwner ? (
                  <button
                    onClick={() => navigate(PATHS.COURTS_MANAGEMENT)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-label cursor-pointer"
                  >
                    <Layers className="h-4 w-4 text-primary" />
                    Quản lý sân
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(PATHS.GROUPS)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-label cursor-pointer"
                  >
                    <UsersRound className="h-4 w-4 text-primary" />
                    Nhóm của tôi
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors font-label cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
