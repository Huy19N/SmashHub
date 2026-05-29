import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeSwitcher from '../../../components/ui/ThemeSwitcher';
import bgDark from '../../../assets/bg_login_Dark.png';
import bgLight from '../../../assets/bg_login_White.png';
import { Flame } from 'lucide-react';

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center items-center">
      {/* Background Images with Cross-fade */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
          <img src={bgDark} alt="Dark Background" className="object-cover w-full h-full" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
          <img src={bgLight} alt="Light Background" className="object-cover w-full h-full" />
        </div>
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-colors duration-1000" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:bg-primary/30 transition-all">
            <Flame className="h-6 w-6 text-primary animate-pulse-slow" />
          </div>
          <span className="text-2xl font-bold font-display tracking-wider text-white">
            SMASH<span className="text-primary">CLUB</span>
          </span>
        </Link>
        <ThemeSwitcher />
      </div>

      {/* Content Area */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 animate-slide-up">
        <div className="glass-panel p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-colors duration-500">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
