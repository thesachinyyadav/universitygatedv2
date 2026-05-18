import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { UserRole } from '@/types/database';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement | null>(null);

  const syncAuthState = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setIsLoggedIn(false);
      setUserRole(null);
      setUsername(null);
      return;
    }

    try {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserRole(user.role);
      setUsername(user.username || null);
    } catch {
      setIsLoggedIn(false);
      setUserRole(null);
      setUsername(null);
    }
  };

  useEffect(() => {
    syncAuthState();

    const handleAuthChange = () => syncAuthState();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth:changed', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth:changed', handleAuthChange as EventListener);
    };
  }, [router.pathname]);

  useEffect(() => {
    if (!showLoginDropdown) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (loginDropdownRef.current && target && !loginDropdownRef.current.contains(target)) {
        setShowLoginDropdown(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowLoginDropdown(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showLoginDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole(null);
    setUsername(null);
    window.dispatchEvent(new Event('auth:changed'));
    router.replace('/');
  };

  const getRoleDashboard = () => {
    switch (userRole) {
      case 'guard':
        return '/guard';
      case 'organiser':
        return '/organiser';
      case 'cso':
        return '/cso';
      default:
        return '/';
    }
  };

  return (
    <nav className="fixed top-[env(safe-area-inset-top)] left-0 right-0 z-50 bg-primary-700 backdrop-blur-md border-b border-primary-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-90 transition">
            <Image
              src="/socio.svg"
              alt="SOCIO"
              width={319}
              height={94}
              priority
              className="h-[15px] sm:h-[17px] w-auto translate-y-[1.5px]"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-base sm:text-lg font-bold tracking-wide text-white leading-none">GATED</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href={getRoleDashboard()}
                  className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="capitalize">{userRole} Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-transparent hover:bg-white/10 text-white border border-white/40 hover:border-white/60 rounded-lg transition flex items-center space-x-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <div className="relative" ref={loginDropdownRef}>
                <button
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className="px-5 py-2 bg-white text-primary-700 hover:bg-white/90 rounded-lg transition font-semibold shadow-sm active:scale-95"
                >
                  Login
                </button>

                {/* Login Dropdown */}
                {showLoginDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100">
                    <div className="px-4 py-3 text-xs text-gray-500 font-semibold border-b border-gray-100">
                      Select Your Role
                    </div>
                    <Link
                      href="/login?role=guard"
                      className="block px-4 py-3 hover:bg-primary-50 transition flex items-center space-x-3"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Security Guard</span>
                    </Link>
                    <Link
                      href="/login"
                      className="block px-4 py-3 hover:bg-primary-50 transition flex items-center space-x-3"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Staff Login</span>
                    </Link>
                    <Link
                      href="/login?role=organiser"
                      className="block px-4 py-3 hover:bg-primary-50 transition flex items-center space-x-3"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span>Event Organiser</span>
                    </Link>
                    <Link
                      href="/login?role=cso"
                      className="block px-4 py-3 hover:bg-primary-50 transition flex items-center space-x-3"
                      onClick={() => setShowLoginDropdown(false)}
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Chief Security Officer</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile greeting + logout (only when logged in) */}
          {isLoggedIn && username && (
            <div className="md:hidden flex items-center gap-2 max-w-[55%]">
              <span className="text-white/90 text-sm font-medium truncate">
                Hi, <span className="font-semibold text-white">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="flex-shrink-0 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
