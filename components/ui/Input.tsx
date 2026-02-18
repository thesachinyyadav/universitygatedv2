import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showCharCount = false,
      maxLength,
      className = '',
      type = 'text',
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      if (onChange) {
        onChange(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    return (
      <div className="w-full group">
        {label && (
          <label className={`input-label flex items-center justify-between transition-colors duration-200 ${error ? 'text-red-500' : isFocused ? 'text-primary-600' : 'text-slate-700'
            }`}>
            <span>{label}</span>
            {showCharCount && maxLength && (
              <span className={`text-xs ${charCount >= maxLength ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                {charCount}/{maxLength}
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${error ? 'text-red-400' : isFocused ? 'text-primary-500' : 'text-slate-400'
              }`}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
            className={`input-field ${error ? 'error' : ''} ${leftIcon ? 'pl-10' : ''
              } ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}

          {error && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="error-msg flex items-center"
            >
              <span className="sr-only">Error:</span>
              {error}
            </motion.p>
          ) : helperText ? (
            <p className="mt-0.5 text-[10px] text-slate-500 ml-1">{helperText}</p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
