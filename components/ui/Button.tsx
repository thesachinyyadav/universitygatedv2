import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

// Exclude React event handlers that conflict with Framer Motion
interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline' | 'ghost' | 'white' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

    // Variant styles matching globals.css and new design system
    const variantStyles = {
      primary: 'btn-primary', // Uses the class from globals.css
      secondary: 'btn-secondary', // Uses the class from globals.css
      tertiary: 'btn-tertiary', // Uses the class from globals.css
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus-visible:ring-red-500',
      outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-primary-700 focus-visible:ring-slate-500',
      white: 'bg-white text-primary-700 hover:bg-gray-50 focus-visible:ring-white',
      glass: 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 focus-visible:ring-white/50'
    };

    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-5 py-2 text-base',
      xl: 'px-6 py-2.5 text-lg font-bold'
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    // Determine the correct class string
    // If it's a predefined class like btn-primary, we don't need additional base styles that might conflict
    const isCustomClass = ['primary', 'secondary', 'tertiary'].includes(variant);
    const combinedClassName = isCustomClass
      ? `${variantStyles[variant]} ${fullWidth ? 'w-full flex justify-center' : ''} ${className}`
      : `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

    return (
      <motion.button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
