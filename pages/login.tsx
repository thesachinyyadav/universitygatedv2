import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';
import { validateRequired } from '@/lib/utils';

export default function Login() {
  const router = useRouter();
  const { role } = router.query;
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getRoleTitle = () => {
    switch (role) {
      case 'guard':
        return 'Security Guard';
      case 'organiser':
        return 'Event Organiser';
      case 'cso':
        return 'Chief Security Officer';
      default:
        return 'Staff';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'guard':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'organiser':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'cso':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const usernameValidation = validateRequired(formData.username, 'Username');
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.error || '';
    }
    
    const passwordValidation = validateRequired(formData.password, 'Password');
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || '';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: role as string,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showToast(`Welcome back, ${data.user.full_name || data.user.username}!`, 'success');

      // Small delay to show the success message
      setTimeout(() => {
        // Redirect to appropriate dashboard
        switch (data.user.role) {
          case 'guard':
            router.push('/guard');
            break;
          case 'organiser':
            router.push('/organiser');
            break;
          case 'cso':
            router.push('/cso');
            break;
          default:
            router.push('/');
        }
      }, 500);
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-10 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_20px_45px_-18px_rgba(0,31,76,0.16)] p-6 sm:p-8">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center text-xs text-slate-500 hover:text-primary-700 transition-colors mb-6"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="text-center mb-7">
            <div className="w-16 h-16 mb-4 mx-auto rounded-xl bg-primary-600 flex items-center justify-center">
              <Image src="/gated.svg" alt="GATED" width={40} height={40} className="w-10 h-10 object-contain" priority />
            </div>
            <div className="inline-flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">
              <span className="text-primary-700">{getRoleIcon()}</span>
              Secure Access
            </div>
            <h1 className="text-3xl font-extrabold text-primary-900 tracking-tight">Secure Login</h1>
            <p className="text-sm text-slate-500 mt-2">{getRoleTitle()} Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-semibold text-slate-600 px-1 tracking-wide">
                {role === 'guard' ? 'Staff ID' : 'Username'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={role === 'guard' ? 'University ID' : 'Enter your username'}
                  className={`w-full bg-slate-50 border rounded-lg py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                    errors.username ? 'border-red-400' : 'border-slate-200 focus:border-primary-400'
                  }`}
                  required
                />
              </div>
              {errors.username && <p className="text-xs text-red-600 px-1">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 tracking-wide">Password</label>
                <button type="button" className="text-[11px] font-medium text-primary-700 hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-1.1 0-2-.9-2-2V8a2 2 0 114 0v1c0 1.1-.9 2-2 2zm-5 9h10a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border rounded-lg py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                    errors.password ? 'border-red-400' : 'border-slate-200 focus:border-primary-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 px-1">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary-50 border border-primary-100 text-[11px] text-primary-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" />
              </svg>
              <span>Encrypted end-to-end session</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-700 hover:bg-primary-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
              {!isSubmitting && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M4 12h16" />
                </svg>
              )}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-primary-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Main Portal
            </button>
          </div>
        </div>

        <div className="mt-6 text-center flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold tracking-widest uppercase">
            <span className="hover:text-primary-700 cursor-pointer transition-colors">Help</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="hover:text-primary-700 cursor-pointer transition-colors">Privacy</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="hover:text-primary-700 cursor-pointer transition-colors">Terms</span>
          </div>
          <p className="text-[11px] text-slate-400 italic">Powered by SOCIO</p>
        </div>
      </motion.div>
      </main>
    </div>
  );
}
