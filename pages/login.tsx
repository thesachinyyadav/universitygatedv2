import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [scale, setScale] = useState(1);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // The login form requires roughly 680px of height to display comfortably
      const minHeight = 680;
      if (window.innerHeight < minHeight) {
        // Calculate a scale factor that shrinks the form to fit the viewport exactly
        setScale((window.innerHeight / minHeight) * 0.98);
        setIsSmallScreen(true);
      } else {
        setScale(1);
        setIsSmallScreen(false);
      }
    };
    
    // Initial check
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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

  const getPortalSubtitle = () => `${getRoleTitle()} Portal`;

  const getUsernameLabel = () => (role === 'guard' ? 'Staff ID' : 'Username');

  const getUsernamePlaceholder = () => (role === 'guard' ? 'Enter your University ID' : 'Enter your username');

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(82,113,255,0.12),_transparent_35%),linear-gradient(180deg,#f7f9ff_0%,#eef3fb_100%)] text-slate-900 flex flex-col">
      <main className="flex-1 flex items-start justify-center px-5 sm:px-8 py-4 sm:py-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-[#dce8ff] rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-28 -right-20 w-80 sm:w-[28rem] h-80 sm:h-[28rem] bg-[#eef5ff] rounded-full blur-3xl opacity-70 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, scale }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: isSmallScreen ? 'top center' : 'center center' }}
          className={`w-full max-w-[720px] relative z-10 ${isSmallScreen ? '' : 'my-auto'}`}
        >
          <div className="bg-white/96 backdrop-blur-sm rounded-[20px] border border-white shadow-[0_30px_90px_-35px_rgba(29,58,118,0.35)] px-6 sm:px-12 pt-6 sm:pt-8 pb-5 sm:pb-6">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 text-[15px] text-[#5c6c94] hover:text-primary-700 transition-colors mb-4 sm:mb-5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Main Portal</span>
            </button>

            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-[#c8d7f7] bg-white px-5 py-3 shadow-[0_10px_30px_-20px_rgba(26,66,164,0.4)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8d7f7] text-primary-700">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" />
                  </svg>
                </div>
                <div className="text-left leading-none">
                  <div className="text-[29px] font-extrabold tracking-[0.04em] text-primary-700">GATED</div>
                  <div className="text-[11px] font-semibold tracking-[0.32em] text-[#5d6f97] mt-1">SECURE ACCESS</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-5 sm:mt-6 mb-5 sm:mb-6">
              <p className="text-[15px] sm:text-[16px] text-[#6e7c9f]">{getPortalSubtitle()}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-[14px] font-semibold text-[#0f225b] px-1">
                  {getUsernameLabel()}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6f84ad] group-focus-within:text-[#305ef5]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={getUsernamePlaceholder()}
                    className={`w-full h-[50px] bg-white border rounded-xl py-3 pl-12 pr-4 text-[15px] text-[#0f225b] placeholder:text-[#7c89aa] shadow-[0_1px_0_rgba(15,34,91,0.02)] transition-all outline-none ${
                      errors.username
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-[#d8e1f2] focus:border-[#325ef7] focus:ring-4 focus:ring-[#dbe6ff]'
                    }`}
                    required
                  />
                </div>
                {errors.username && <p className="text-xs text-red-600 px-1">{errors.username}</p>}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="px-1">
                  <label htmlFor="password" className="block text-[14px] font-semibold text-[#0f225b]">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6f84ad] group-focus-within:text-[#305ef5]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`w-full h-[50px] bg-white border rounded-xl py-3 pl-12 pr-12 text-[15px] text-[#0f225b] placeholder:text-[#7c89aa] shadow-[0_1px_0_rgba(15,34,91,0.02)] transition-all outline-none ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-[#d8e1f2] focus:border-[#325ef7] focus:ring-4 focus:ring-[#dbe6ff]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8dac] hover:text-[#2648c7] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 px-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[50px] bg-[#1f4eb5] hover:bg-[#1b45a3] disabled:opacity-60 text-white font-semibold text-[17px] rounded-xl shadow-[0_14px_24px_-14px_rgba(31,78,181,0.75)] transition-all active:scale-[0.99] flex items-center justify-center gap-3"
              >
                <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
                {!isSubmitting && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M4 12h16" />
                  </svg>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 text-center flex flex-col items-center gap-2 text-[#7483a5]">
            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.28em] uppercase">
              <Link href="/help" className="hover:text-primary-700 cursor-pointer transition-colors">Help</Link>
              <span className="text-[#b7c3dc]">•</span>
              <Link href="/privacy" className="hover:text-primary-700 cursor-pointer transition-colors">Privacy</Link>
              <span className="text-[#b7c3dc]">•</span>
              <Link href="/terms" className="hover:text-primary-700 cursor-pointer transition-colors">Terms</Link>
            </div>
            <p className="text-[13px] text-[#8b97b4]">Powered by <span className="font-semibold text-primary-700">SOCIO</span></p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
