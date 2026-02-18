import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserRole } from '@/types/database';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserRole(user.role);
    }

    // Close mobile menu on route change
    setShowMobileMenu(false);
    setShowLoginDropdown(false);
  }, [router.pathname]);

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLoginDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
    setShowMobileMenu(false);
  };

  const getRoleDashboard = () => {
    switch (userRole) {
      case 'guard': return '/guard';
      case 'organiser': return '/organiser';
      case 'cso': return '/cso';
      default: return '/';
    }
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="bg-primary-600/95 backdrop-blur-md text-white sticky top-0 z-50 border-b border-primary-500/50 shadow-glass"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-2 group outline-none">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow-lg ring-2 ring-primary-400/50 group-focus-visible:ring-tertiary-400"
            >
              <Image
                src="/christunifavcion.png"
                alt="Christ University"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-bold leading-none tracking-tight text-white group-hover:text-tertiary-200 transition-colors">
                Christ University
              </h1>
              <p className="text-[9px] md:text-[10px] text-primary-200 font-medium tracking-wider uppercase mt-0.5">
                Gated Access Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={getRoleDashboard()}
                  className="px-4 py-2 bg-primary-700/50 hover:bg-primary-500 rounded-lg transition-all duration-200 flex items-center space-x-2 border border-primary-500/30 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="capitalize">{userRole} Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-white text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-semibold shadow-sm hover:shadow-md active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className={`px-6 py-2.5 rounded-lg transition-all font-semibold shadow-lg flex items-center space-x-2 ${showLoginDropdown
                    ? 'bg-white text-primary-700 ring-2 ring-primary-300'
                    : 'bg-tertiary-600 hover:bg-tertiary-500 text-white'
                    }`}
                >
                  <span>Login Portal</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showLoginDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {/* Login Dropdown */}
                <AnimatePresence>
                  {showLoginDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl py-2 text-slate-800 border border-slate-100 overflow-hidden ring-1 ring-black/5"
                    >
                      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Access Role</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          href="/visitor-register"
                          className="group block px-4 py-3 hover:bg-primary-50 rounded-lg transition-all flex items-start space-x-3"
                          onClick={() => setShowLoginDropdown(false)}
                        >
                          <div className="mt-0.5 p-1.5 bg-primary-100 text-primary-600 rounded-md group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-800 group-hover:text-primary-700">Visitor / Student</span>
                            <span className="block text-xs text-slate-500 mt-0.5">Register for entry or events</span>
                          </div>
                        </Link>

                        <div className="h-px bg-slate-100 my-1 mx-4"></div>

                        <Link
                          href="/login?role=guard"
                          className="group block px-4 py-3 hover:bg-primary-50 rounded-lg transition-all flex items-start space-x-3"
                          onClick={() => setShowLoginDropdown(false)}
                        >
                          <div className="mt-0.5 p-1.5 bg-primary-100 text-primary-600 rounded-md group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-800 group-hover:text-primary-700">Security Guard</span>
                            <span className="block text-xs text-slate-500 mt-0.5">Verify and manage entry</span>
                          </div>
                        </Link>

                        <Link
                          href="/login?role=organiser"
                          className="group block px-4 py-3 hover:bg-primary-50 rounded-lg transition-all flex items-start space-x-3"
                          onClick={() => setShowLoginDropdown(false)}
                        >
                          <div className="mt-0.5 p-1.5 bg-primary-100 text-primary-600 rounded-md group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-800 group-hover:text-primary-700">Event Organiser</span>
                            <span className="block text-xs text-slate-500 mt-0.5">Create and manage events</span>
                          </div>
                        </Link>

                        <Link
                          href="/login?role=cso"
                          className="group block px-4 py-3 hover:bg-primary-50 rounded-lg transition-all flex items-start space-x-3"
                          onClick={() => setShowLoginDropdown(false)}
                        >
                          <div className="mt-0.5 p-1.5 bg-primary-100 text-primary-600 rounded-md group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-800 group-hover:text-primary-700">Chief Security Officer</span>
                            <span className="block text-xs text-slate-500 mt-0.5">System administration</span>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {showMobileMenu ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-3 border-t border-primary-500/30">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={getRoleDashboard()}
                      className="block w-full px-4 py-3 bg-primary-700/50 hover:bg-primary-700 rounded-lg transition flex items-center space-x-3"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="capitalize font-medium">{userRole} Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 bg-white text-primary-700 hover:bg-primary-50 rounded-lg transition flex items-center space-x-3 font-semibold shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 bg-primary-700/30 rounded-xl p-3">
                    <div className="px-2 py-1 text-xs text-primary-200 font-bold uppercase tracking-wider">
                      Access Portals
                    </div>
                    <Link
                      href="/visitor-register"
                      className="block w-full px-4 py-3 hover:bg-primary-600/50 rounded-lg transition flex items-center space-x-3"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="p-1.5 bg-white/10 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <span className="font-medium">Visitor Registration</span>
                    </Link>
                    <Link
                      href="/login?role=guard"
                      className="block w-full px-4 py-3 hover:bg-primary-600/50 rounded-lg transition flex items-center space-x-3"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="p-1.5 bg-white/10 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="font-medium">Security Login</span>
                    </Link>
                    <Link
                      href="/login?role=organiser"
                      className="block w-full px-4 py-3 hover:bg-primary-600/50 rounded-lg transition flex items-center space-x-3"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="p-1.5 bg-white/10 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <span className="font-medium">Organiser Login</span>
                    </Link>
                    <Link
                      href="/login?role=cso"
                      className="block w-full px-4 py-3 hover:bg-primary-600/50 rounded-lg transition flex items-center space-x-3"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="p-1.5 bg-white/10 rounded-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">CSO Login</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
