import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated' | 'glass';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  children,
  title,
  subtitle,
  footer,
  headerAction,
  variant = 'default',
  className = '',
  onClick,
  hoverable = false
}: CardProps) {
  const variantStyles = {
    default: 'card',
    bordered: 'card border-2 border-slate-200 shadow-none',
    elevated: 'card shadow-lg border-transparent',
    glass: 'glass rounded-xl p-5 border-white/40' // New glassmorphism variant
  };

  const hoverStyles = hoverable || onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : '';

  return (
    <motion.div
      className={`${variantStyles[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100/50">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-0.5">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div className="ml-4">{headerAction}</div>
          )}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-5 pt-4 border-t border-gray-100/50">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

// Quick Action Card for Dashboards
export function QuickActionCard({
  icon,
  title,
  description,
  onClick,
  badge,
  className = ''
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  badge?: string | number;
  className?: string;
}) {
  return (
    <motion.div
      className={`card cursor-pointer group relative overflow-hidden ${className}`}
      onClick={onClick}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>

      {badge !== undefined && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
          {badge}
        </div>
      )}

      <div className="flex flex-col items-center text-center p-2">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <h4 className="font-bold text-slate-800 mb-1.5 text-base">{title}</h4>
        {description && (
          <p className="text-sm text-slate-500 leading-snug">{description}</p>
        )}
      </div>
    </motion.div>
  );
}

// Stats Card for Analytics
export function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  className = ''
}: {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-600'
              }`}>
              {trend === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className="font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}
