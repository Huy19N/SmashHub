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
  User,
  Smartphone,
} from 'lucide-react';
import { PATHS } from '../../routes/paths';
import useAuth, { useGetUserId } from '../../features/Auth/hooks/useAuth';
import MediaImage from '../ui/MediaImage';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const avatarDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications() || { notifications: [], unreadCount: 0, markAsRead: () => { }, markAllAsRead: () => { }, clearNotification: () => { } };

  const { user, logout } = useAuth();
  const { user: apiUser } = useGetUserId();
  const isAuthenticated = !!user;
  const avatarInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const roleId = apiUser?.data?.roleId?.toString() || user?.roleId || localStorage.getItem('roleId');
  const isFacilityOwner = roleId === '3';
  const isAdmin = roleId === '1';

  const isHomePage = location.pathname === PATHS.HOME;

  const isItemActive = (item, navLinkActive) => {
    if (!isHomePage) return navLinkActive;
    const currentHash = location.hash;

    if (item.name === 'Tải App') {
      return currentHash === '#download-app' || currentHash === '#download-app-section';
    }
    if (item.name === 'Hội viên') {
      return currentHash === '#premium' || currentHash === '#premium-section';
    }
    if (item.name === 'Bộ sưu tập') {
      return currentHash === '#collections' || currentHash === '#collections-section';
    }
    if (item.name === 'Liên hệ') {
      return currentHash === '#contact' || currentHash === '#contact-section';
    }
    if (item.name === 'Trang chủ') {
      return !currentHash || currentHash === '#' || currentHash === '#top';
    }
    return navLinkActive;
  };

  const handleNavItemClick = (e, item, isMobile = false) => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }

    if (item.name === 'Trang chủ') {
      if (isHomePage) {
        e.preventDefault();
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (item.sectionId) {
      e.preventDefault();
      const targetHash = item.hash;
      const scrollAction = () => {
        document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth' });
      };

      if (isHomePage) {
        navigate(`/${targetHash}`);
        if (isMobile) {
          setTimeout(scrollAction, 100);
        } else {
          scrollAction();
        }
      } else {
        navigate(`/${targetHash}`);
        setTimeout(scrollAction, 150);
      }
    }
  };

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

  // Close avatar and notification dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target)) {
        setAvatarDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setAvatarDropdownOpen(false);
    navigate(PATHS.LOGIN);
  };

  const navItems = [
    { name: 'Trang chủ', path: PATHS.HOME, sectionId: null, hash: '', icon: Home },
    { name: 'Tải App', path: '/#download-app', sectionId: 'download-app-section', hash: '#download-app', icon: Smartphone },
    { name: 'Liên hệ', path: '/#contact', sectionId: 'contact-section', hash: '#contact', icon: Mail },
    { name: 'Hội viên', path: '/#premium', sectionId: 'premium-section', hash: '#premium', icon: Crown },
    { name: 'Bộ sưu tập', path: '/#collections', sectionId: 'collections-section', hash: '#collections', icon: Layers },
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
          <Link to={PATHS.HOME} className="flex items-center gap-2 group active:scale-95 transition-transform duration-200">
            <div className="bg-white p-0 h-9 w-9 rounded-full border border-slate-100 dark:border-white/10 group-hover:border-emerald-500 dark:group-hover:border-primary shadow-[0_3px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_3px_10px_rgba(0,0,0,0.2)] overflow-hidden flex items-center justify-center transition-all duration-300">
              <img src="/Logo.png" alt="Logo" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
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
                onClick={(e) => handleNavItemClick(e, item, false)}
                className={({ isActive }) => {
                  const active = isItemActive(item, isActive);
                  return `
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95 hover:scale-[1.03]
                    ${active
                      ? 'bg-emerald-500/10 dark:bg-primary/10 text-emerald-700 dark:text-primary border border-emerald-500/20 dark:border-primary/20 shadow-[0_0_15px_rgba(11,232,96,0.15)]'
                      : 'text-slate-800 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-white hover:bg-emerald-500/5 dark:hover:bg-white/5 border border-transparent'}
                  `;
                }}
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
                {/* Notification Bell */}
                <div className="relative" ref={notificationDropdownRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-[#131b2c]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right animate-fade-in">
                      <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Thông báo ({unreadCount})</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-emerald-600 dark:text-primary hover:underline font-semibold"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Chưa có thông báo nào.
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            {notifications.map(notif => (
                              <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`relative p-4 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${!notif.isRead ? 'bg-emerald-50/50 dark:bg-primary/5' : ''}`}
                              >
                                {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 dark:bg-primary" />}
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>
                                      {notif.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                      {notif.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 block">
                                      {notif.timestamp.toLocaleTimeString('vi-VN')} - {notif.timestamp.toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Avatar with Dropdown */}
                <div className="relative" ref={avatarDropdownRef}>
                  <div
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    title={user?.name || 'Account'}
                    className="h-10 w-10 rounded-full overflow-hidden shadow-md ring-2 ring-emerald-500/30 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative"
                  >
                    {apiUser?.data?.avatarFileId ? (
                      <MediaImage
                        fileId={apiUser.data.avatarFileId}
                        alt={user?.name || 'Avatar'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: apiUser?.data?.avatarFileId ? 'none' : 'flex' }}
                      className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 items-center justify-center font-bold text-white text-lg select-none"
                    >
                      {avatarInitials}
                    </div>
                  </div>
                  {/* Dropdown Menu */}
                  <div
                    className={`absolute right-0 top-full mt-3 flex flex-col items-end gap-3 z-50 w-48 transition-all duration-300 ease-out origin-top-right ${avatarDropdownOpen
                      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                      : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                      }`}
                  >
                    {/* Vertical connecting line */}
                    <div
                      className={`absolute right-5 top-0 bottom-5 w-px border-l-2 border-dashed border-emerald-500/20 dark:border-primary/20 pointer-events-none z-0 transition-all duration-500 origin-top ${avatarDropdownOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                        }`}
                    />

                    {/* Header Pill */}
                    <div
                      className={`relative z-10 mr-1 bg-white/95 dark:bg-[#0c0f17]/95 text-slate-800 dark:text-white px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-primary/20 text-[10px] font-black tracking-wider uppercase whitespace-nowrap mb-1 transition-all duration-300 ease-out ${avatarDropdownOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-90'
                        }`}
                      style={{ transitionDelay: avatarDropdownOpen ? '50ms' : '0ms' }}
                    >
                      {user?.roleName || 'Vận động viên'}
                    </div>

                    {/* Action 1: Dashboard / Management / Groups */}
                    <div
                      className={`relative flex items-center justify-end h-10 w-48 group select-none transition-all duration-300 ease-out ${avatarDropdownOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-90'
                        }`}
                      style={{ transitionDelay: avatarDropdownOpen ? '100ms' : '0ms' }}
                    >
                      <button
                        onClick={() => {
                          setAvatarDropdownOpen(false);
                          if (isAdmin) navigate(PATHS.ADMIN_DASHBOARD);
                          else if (isFacilityOwner) navigate(PATHS.COURTS_MANAGEMENT);
                          else navigate(PATHS.GROUPS);
                        }}
                        className="absolute right-0 h-10 rounded-full bg-white dark:bg-[#0c0f17] border border-gray-200 dark:border-primary/20 shadow-lg flex items-center pl-4 pr-12 overflow-hidden w-10 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300 ease-out z-0 pointer-events-none group-hover:pointer-events-auto cursor-pointer"
                      >
                        <span className="text-xs font-black text-gray-800 dark:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 font-label">
                          {isAdmin ? 'Trang quản trị' : isFacilityOwner ? 'Quản lý sân' : 'Nhóm của tôi'}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setAvatarDropdownOpen(false);
                          if (isAdmin) navigate(PATHS.ADMIN_DASHBOARD);
                          else if (isFacilityOwner) navigate(PATHS.COURTS_MANAGEMENT);
                          else navigate(PATHS.GROUPS);
                        }}
                        className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-primary dark:to-emerald-500 text-white dark:text-[#052e14] flex items-center justify-center shadow-lg border border-white/10 z-10 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-250 hover:rotate-6"
                        title={isAdmin ? 'Trang quản trị' : isFacilityOwner ? 'Quản lý sân' : 'Nhóm của tôi'}
                      >
                        {isAdmin ? (
                          <Crown className="h-4.5 w-4.5" />
                        ) : isFacilityOwner ? (
                          <Layers className="h-4.5 w-4.5" />
                        ) : (
                          <UsersRound className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>

                    {/* Action 2: Trang cá nhân */}
                    <div
                      className={`relative flex items-center justify-end h-10 w-48 group select-none transition-all duration-300 ease-out ${avatarDropdownOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-90'
                        }`}
                      style={{ transitionDelay: avatarDropdownOpen ? '150ms' : '0ms' }}
                    >
                      <button
                        onClick={() => {
                          setAvatarDropdownOpen(false);
                          navigate(PATHS.PROFILE);
                        }}
                        className="absolute right-0 h-10 rounded-full bg-white dark:bg-[#0c0f17] border border-gray-200 dark:border-primary/20 shadow-lg flex items-center pl-4 pr-12 overflow-hidden w-10 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300 ease-out z-0 pointer-events-none group-hover:pointer-events-auto cursor-pointer"
                      >
                        <span className="text-xs font-black text-gray-800 dark:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 font-label">
                          Trang cá nhân
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setAvatarDropdownOpen(false);
                          navigate(PATHS.PROFILE);
                        }}
                        className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-primary dark:to-emerald-500 text-white dark:text-[#052e14] flex items-center justify-center shadow-lg border border-white/10 z-10 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-250 hover:rotate-6"
                        title="Trang cá nhân"
                      >
                        <User className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {/* Action 3: Đăng xuất */}
                    <div
                      className={`relative flex items-center justify-end h-10 w-48 group select-none transition-all duration-300 ease-out ${avatarDropdownOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-90'
                        }`}
                      style={{ transitionDelay: avatarDropdownOpen ? '200ms' : '0ms' }}
                    >
                      <button
                        onClick={handleLogout}
                        className="absolute right-0 h-10 rounded-full bg-white dark:bg-[#0c0f17] border border-red-200 dark:border-red-500/20 shadow-lg flex items-center pl-4 pr-12 overflow-hidden w-10 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300 ease-out z-0 pointer-events-none group-hover:pointer-events-auto cursor-pointer"
                      >
                        <span className="text-xs font-black text-red-600 dark:text-red-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 font-label">
                          Đăng xuất
                        </span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg border border-white/10 z-10 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-250 hover:rotate-6"
                        title="Đăng xuất"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to={PATHS.LOGIN}
                className="inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-bold bg-emerald-500 hover:bg-emerald-600 dark:bg-primary dark:hover:bg-primary-dark text-[#052e14] dark:text-white transition-all duration-300 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 cursor-pointer font-label relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.04)_50%,rgba(0,0,0,0.04)_75%,transparent_75%,transparent)] bg-[length:10px_10px] pointer-events-none group-hover:scale-105 transition-transform duration-300" />
                <span className="relative z-10">Đăng nhập</span>
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
        <div className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl animate-dropdown absolute w-full left-0 top-full shadow-2xl">
          <nav className="px-3 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavItemClick(e, item, true)}
                className={({ isActive }) => {
                  const active = isItemActive(item, isActive);
                  return `
                    flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 active:scale-[0.98] hover:scale-[1.01]
                    ${active
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(11,232,96,0.1)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  `;
                }}
              >
                <item.icon className="h-5 w-5 text-gray-400" />
                {item.name}
              </NavLink>
            ))}

            {!isAuthenticated && (
              <div className="pt-4 px-2">
                <Link
                  to={PATHS.LOGIN}
                  className="flex justify-center items-center gap-2 w-full py-3 rounded-lg text-base font-bold bg-primary text-[#052e14] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.04)_50%,rgba(0,0,0,0.04)_75%,transparent_75%,transparent)] bg-[length:10px_10px] pointer-events-none group-hover:scale-105 transition-transform duration-300" />
                  <span className="relative z-10">Đăng nhập</span>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-4 pb-2 border-t border-white/10 mt-4 px-2 space-y-2">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden shadow-md ring-2 ring-emerald-500/30 flex items-center justify-center relative">
                    {apiUser?.data?.avatarFileId ? (
                      <MediaImage
                        fileId={apiUser.data.avatarFileId}
                        alt={user?.name || 'Avatar'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: apiUser?.data?.avatarFileId ? 'none' : 'flex' }}
                      className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 items-center justify-center font-bold text-white text-lg select-none"
                    >
                      {avatarInitials}
                    </div>
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
