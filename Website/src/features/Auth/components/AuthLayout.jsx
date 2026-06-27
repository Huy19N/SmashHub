import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemeSwitcher } from '../../../contexts/ThemeContext';
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

      {/* Dynamic TasteSkill Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-emerald-300/20 rounded-full mix-blend-screen filter blur-[150px] animate-pulse-slow pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.12)] overflow-hidden transition-all group-hover:scale-105">
            <img src="/Logo.png" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-2xl font-bold font-display tracking-wider text-white">
            SMASH<span className="text-primary">HUB</span>
          </span>
        </Link>
        <ThemeSwitcher />
      </div>

      {/* Content Area */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 animate-slide-up mt-10">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-colors duration-500 border border-white/20">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
