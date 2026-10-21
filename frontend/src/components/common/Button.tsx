import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider transition-all duration-150 select-none active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs gap-2',
    lg: 'px-6 py-3 text-sm gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-scout-neon text-black hover:bg-[#d8ff33] hover:shadow-neon focus:ring-2 focus:ring-scout-neon focus:outline-none border border-scout-neon',
    neon: 'bg-scout-neon text-black hover:bg-[#d8ff33] hover:shadow-neon focus:ring-2 focus:ring-scout-neon focus:outline-none border border-scout-neon',
    secondary: 'bg-scout-card hover:bg-scout-cardHover text-scout-text border border-scout-border hover:border-scout-borderLight focus:outline-none',
    outline: 'bg-transparent text-scout-neon border border-scout-neon/60 hover:border-scout-neon hover:bg-scout-neon/10 focus:outline-none shadow-neon-sm',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-700 hover:bg-rose-900 focus:outline-none',
    ghost: 'bg-transparent text-scout-muted hover:text-white hover:bg-white/5 border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
