import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  className = '',
  isLoading,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-4 rounded-lg text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-label";

  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-[#052e14] shadow-md shadow-primary/20 hover:-translate-y-0.5",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-border-dark dark:hover:bg-gray-700 dark:text-white",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
