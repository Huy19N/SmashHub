import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'emerald', subtext }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-primary/10',
      border: 'border-emerald-500/20 dark:border-primary/20',
      text: 'text-emerald-600 dark:text-primary',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    orange: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400',
    },
  };

  const selectedColor = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider font-label">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight group-hover:scale-[1.02] transition-transform origin-left">
            {value}
          </p>
        </div>
        <div className={`h-11 w-11 rounded-xl ${selectedColor.bg} border ${selectedColor.border} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-6 duration-200`}>
          <Icon className={`h-5.5 w-5.5 ${selectedColor.text}`} />
        </div>
      </div>
      {subtext && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-label mt-3 border-t border-gray-50 dark:border-white/5 pt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
