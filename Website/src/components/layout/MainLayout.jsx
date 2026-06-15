import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { PATHS } from '../../routes/paths';

/**
 * MainLayout
 * The premium application shell offering responsive navigation, glassmorphic styling,
 * 60fps transitions, and active routing indicators.
 */
export default function MainLayout() {
  const location = useLocation();

  // If on the home page, bypass the generic internal page shell to allow full-bleed immersive content
  if (location.pathname === PATHS.HOME) {
    return (
      <>
        <Navbar />
        <Outlet />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-gray-100 flex flex-col antialiased">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-dark py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} SmashHub. All rights reserved. Built for 60fps performance and modular SEO scalability.
          </div>
          <div className="flex gap-6 text-xs sm:text-sm text-gray-400">
            <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#support" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
