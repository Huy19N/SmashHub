import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-5 w-full">
      {label && (
        <label className="text-lg font-semibold text-gray-100 font-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-6 py-5 rounded-lg border text-sm transition-all duration-300 outline-none
          bg-white/10 backdrop-blur-md
          border-gray-500/50
          text-white placeholder:text-gray-400
          focus:border-primary focus:ring-2 focus:ring-primary/20
          focus:text-primary focus:[text-shadow:_0_0_10px_rgba(11,232,96,0.8)]
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
