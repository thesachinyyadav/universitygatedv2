import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
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
  const [keepSignedIn, setKeepSignedIn] = useState(false);

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
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'organiser':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'cso':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="min-h-screen bg-[#f5f7fb] px-3 sm:px-4 py-4 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6"
        >
          <div className="flex items-center gap-2">
            <Image src="/socio.svg" alt="SOCIO" width={24} height={24} className="w-6 h-6" />
            <p className="text-sm font-semibold text-gray-800">SOCIO Security</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <button type="button" onClick={() => router.push('/')} className="hover:text-primary-700 transition-colors">Home</button>
            <button type="button" onClick={() => router.push('/retrieve-qr')} className="hover:text-primary-700 transition-colors">Help</button>
            <button type="button" onClick={() => router.push('/')} className="px-3 py-1.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">Support</button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden w-full max-w-sm mx-auto"
        >
          <div className="bg-white rounded-2xl border border-primary-300 shadow-lg p-5">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-primary-700 text-sm mb-6"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center shadow-sm">
                <Image src="/socio.svg" alt="SOCIO" width={40} height={40} className="w-10 h-10 object-contain" priority />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{getRoleTitle()} Login</h1>
              <p className="text-sm text-gray-500">Enter your credentials to access the system</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={role === 'guard' ? 'Staff ID' : 'Username'}
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder={role === 'guard' ? 'Enter your staff ID' : 'Enter your username'}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[41px] text-gray-400 hover:text-gray-600"
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

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              Powered by <span className="font-semibold text-primary-700">SOCIO</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:grid md:grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white"
        >
          <div className="bg-gradient-to-b from-primary-600 to-primary-700 text-white px-12 py-14 flex flex-col justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
              {getRoleIcon()}
            </div>
            <h2 className="text-4xl font-bold mb-4">{getRoleTitle()} Portal</h2>
            <p className="text-white/85 text-lg leading-relaxed max-w-md mb-10">
              Ensuring a safe and secure environment with real-time entry verification.
            </p>
            <div className="h-px bg-white/20 mb-6" />
            <p className="text-xs tracking-[0.2em] uppercase text-white/75">Powered by SOCIO</p>
          </div>

          <div className="px-10 py-10 lg:px-12 lg:py-12">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-primary-700 mb-6 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Login</h1>
            <p className="text-gray-500 mb-8">Please enter your credentials to access the secure portal.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Staff ID / Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="Enter your staff ID"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[41px] text-gray-400 hover:text-gray-600"
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

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Keep me logged in for this shift
                </label>
                <button type="button" className="text-primary-700 font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={
                  !isSubmitting ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  ) : undefined
                }
              >
                {isSubmitting ? 'Logging in...' : 'Secure Login'}
              </Button>
            </form>

            <p className="text-xs text-gray-400 mt-8 text-center">Authorized Access Only · Powered by SOCIO</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
