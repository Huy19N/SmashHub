import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-3 w-full text-left">
      {label && (
        <label className="text-sm font-semibold text-slate-800 dark:text-gray-200 font-label transition-colors duration-500">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-5 py-4 rounded-2xl border text-sm transition-all duration-300 outline-none
          bg-slate-100/90 dark:bg-white/10 backdrop-blur-md
          border-slate-200 dark:border-gray-500/30
          text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:text-emerald-700
          dark:focus:border-primary dark:focus:ring-primary/20 dark:focus:text-primary
          focus:[text-shadow:_0_0_8px_rgba(16,185,129,0.15)] dark:focus:[text-shadow:_0_0_10px_rgba(11,232,96,0.8)]
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
