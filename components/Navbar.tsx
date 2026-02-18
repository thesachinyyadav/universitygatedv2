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
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserRole(user.role);
    }
    setShowMobileMenu(false);
    setShowLoginDropdown(false);
  }, [router.pathname]);

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

  const loginLinks = [
    { href: '/visitor-register', label: 'Visitor / Student', desc: 'Register for entry or events', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { href: '/login?role=guard', label: 'Security Guard', desc: 'Verify and manage entry', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { href: '/login?role=organiser', label: 'Event Organiser', desc: 'Create and manage events', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { href: '/login?role=cso', label: 'Chief Security Officer', desc: 'System administration', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ];

  return (
    <nav className="bg-primary-600 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group outline-none">
            <div className="w-8 h-8 bg-white rounded-lg p-1 flex items-center justify-center shadow-sm">
              <Image
                src="/christunifavcion.png"
                alt="Christ University"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none text-white">Christ University</h1>
              <p className="text-[9px] text-primary-200 font-medium tracking-wider uppercase mt-0.5">Gated Access</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href={getRoleDashboard()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="capitalize">{userRole} Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white text-primary-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${showLoginDropdown
                      ? 'bg-white text-primary-700'
                      : 'bg-secondary-500 hover:bg-secondary-400 text-primary-900'
                    }`}
                >
                  Login Portal
                  <svg className={`w-3.5 h-3.5 transition-transform ${showLoginDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showLoginDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg py-1 text-slate-800 border border-slate-100 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Access Role</p>
                      </div>

                      <div className="p-1.5">
                        {loginLinks.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 rounded-lg transition-all group"
                            onClick={() => setShowLoginDropdown(false)}
                          >
                            <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                              </svg>
                            </div>
                            <div>
                              <span className="block text-sm font-semibold text-slate-800 group-hover:text-primary-700">{link.label}</span>
                              <span className="block text-[11px] text-slate-400">{link.desc}</span>
                            </div>
                          </Link>
                        ))}
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
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
          >
            {showMobileMenu ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="py-3 space-y-1.5 border-t border-white/10">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={getRoleDashboard()}
                      className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/15 rounded-xl transition"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="capitalize font-medium">{userRole} Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white text-primary-700 rounded-xl font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    <p className="px-4 py-1 text-[10px] text-primary-300 font-bold uppercase tracking-wider">Access Portals</p>
                    {loginLinks.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 rounded-xl transition"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                          </svg>
                        </div>
                        <span className="font-medium text-sm">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
