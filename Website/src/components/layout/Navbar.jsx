import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';
import { PATHS } from '../../routes/paths';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Mock authentication state (for testing UI)
  const isAuthenticated = false;

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
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: PATHS.HOME, icon: Home },
    { name: 'About Us', path: PATHS.ABOUT, icon: Users },
    { name: 'Contact', path: PATHS.CONTACT, icon: Mail },
    { name: 'Premium', path: PATHS.PREMIUM, icon: Crown },
    { name: 'Collections', path: PATHS.COLLECTIONS, icon: Layers },
  ];

  // Logic to determine background styling
  // If on HomePage and NOT scrolled, it's transparent.
  // Otherwise, it's the solid glass-panel.
  const headerClasses = isHomePage
    ? `fixed top-0 left-0 w-full z-50 transition-all duration-500 font-label ${isScrolled
      ? 'bg-[#0b0f19]/80 backdrop-blur-md border-b border-border-dark/60 py-3 shadow-lg shadow-black/40'
      : 'bg-transparent border-b border-transparent py-5'
    }`
    : `sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-md border-b border-border-dark py-3 shadow-lg shadow-black/40 font-label w-full transition-all duration-300`;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={PATHS.HOME} className="flex items-center gap-2 group">
            <div className="bg-primary/20 p-2 rounded-lg border border-primary/30 group-hover:border-primary group-hover:bg-primary/30 transition-all duration-300">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display text-gradient-primary">
              SMASH<span className="text-white">CLUB</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'}
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
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center font-bold text-bg-dark text-sm border border-white/20 cursor-pointer">
                  H
                </div>
              </>
            ) : (
              <Link
                to={PATHS.LOGIN}
                className="inline-flex items-center justify-center px-6 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-dark text-[#052e14] transition-all duration-300 shadow-md shadow-primary/20 hover:-translate-y-0.5 cursor-pointer font-label"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-dark bg-[#0b0f19]/95 backdrop-blur-xl animate-fade-in absolute w-full left-0 top-full shadow-2xl">
          <nav className="px-3 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
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
                  Sign In
                </Link>
              </div>
            )}
            
            {isAuthenticated && (
              <div className="pt-4 pb-2 border-t border-white/10 mt-4 px-2 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center font-bold text-bg-dark text-lg border border-white/20">
                  H
                </div>
                <div>
                  <div className="text-white font-medium">Huy Nguyen</div>
                  <div className="text-gray-400 text-sm cursor-pointer hover:text-primary transition-colors">View Profile</div>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
