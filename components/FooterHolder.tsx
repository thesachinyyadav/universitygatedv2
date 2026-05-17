import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

type Role = 'guard' | 'organiser' | 'cso' | null;

interface NavItem {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: JSX.Element;
}

export default function FooterHolder() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const syncAuthState = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setIsLoggedIn(false);
      setRole(null);
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      setIsLoggedIn(true);
      setRole((parsed.role as Role) || null);
    } catch {
      setIsLoggedIn(false);
      setRole(null);
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

  const dashboardHref =
    role === 'guard' ? '/guard' : role === 'organiser' ? '/organiser' : role === 'cso' ? '/cso' : '/login';

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setRole(null);
    window.dispatchEvent(new Event('auth:changed'));
    router.push('/');
  };

  const navItems = useMemo<NavItem[]>(() => {
    if (isLoggedIn) {
      return [
        {
          key: 'home',
          label: 'Home',
          href: '/',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3l9 7h-3v10h-5v-6H11v6H6V10H3l9-7z" />
            </svg>
          ),
        },
        {
          key: 'dashboard',
          label: 'Dashboard',
          href: dashboardHref,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l7-7 4 4 7-7M5 19h14" />
            </svg>
          ),
        },
      ];
    }

    return [
      {
        key: 'home',
        label: 'Home',
        href: '/',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3l9 7h-3v10h-5v-6H11v6H6V10H3l9-7z" />
          </svg>
        ),
      },
      {
        key: 'login',
        label: 'Login',
        onClick: () => setShowRoleModal(true),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
    ];
  }, [dashboardHref, isLoggedIn]);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile bottom tab bar - fixed */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <nav
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              const className = `flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition ${
                active ? 'text-primary-700 bg-primary-50 font-semibold' : 'text-slate-400'
              }`;

              if (item.href) {
                return (
                  <Link key={item.key} href={item.href} className={className}>
                    {item.icon}
                    <span className="text-[11px] uppercase tracking-wide">{item.label}</span>
                  </Link>
                );
              }

              return (
                <button key={item.key} onClick={item.onClick} className={className}>
                  {item.icon}
                  <span className="text-[11px] uppercase tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop footer - in normal flow at page bottom */}
      <footer className="hidden md:block border-t border-slate-200" style={{ backgroundColor: '#1e3a8a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col items-center text-center gap-2">
          <div className="flex items-center justify-center gap-3 text-xs font-semibold text-white/90">
            <Link href="/help" className="hover:text-white">Help</Link>
            <span className="text-white/50">•</span>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <span className="text-white/50">•</span>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p className="text-white text-xs sm:text-sm">
            © 2026 Christ University • Secure Gated Access Management
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Powered by</p>
          <Image
            src="/socio.svg"
            alt="SOCIO"
            width={70}
            height={20}
            className="h-5 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </footer>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRoleModal(false)} />
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Image src="/socio.svg" alt="SOCIO" width={48} height={48} className="w-6 h-6 object-contain" />
                <span className="font-bold text-slate-900 text-sm tracking-wide">GATED</span>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-700 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-2 pt-3 pb-0 space-y-1">
              <div className="px-4 py-2 text-xs text-slate-500 font-medium">Select Your Role</div>
              
              <Link href="/login?role=guard" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition rounded-xl" onClick={() => setShowRoleModal(false)}>
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-slate-700 text-[15px] font-medium">Security Guard</span>
              </Link>

              <Link href="/login" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition rounded-xl" onClick={() => setShowRoleModal(false)}>
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-slate-700 text-[15px] font-medium">Staff Login</span>
              </Link>

              <Link href="/login?role=organiser" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition rounded-xl" onClick={() => setShowRoleModal(false)}>
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="text-slate-700 text-[15px] font-medium">Event Organiser</span>
              </Link>

              <Link href="/login?role=cso" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition rounded-xl" onClick={() => setShowRoleModal(false)}>
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-slate-700 text-[15px] font-medium">Chief Security Officer</span>
              </Link>
            </div>
            
            <div className="mx-4 mb-4 border-t-2 border-slate-400" />
            {/* Quick Actions (like Retrieve Lost QR Code if needed, optional based on screenshot) */}
            <div className="bg-slate-900 mx-4 mb-4 mt-2 p-3 rounded-xl shadow-lg border border-slate-700 hover:bg-slate-800 transition cursor-pointer flex items-center justify-center space-x-2" onClick={() => { setShowRoleModal(false); router.push('/retrieve-qr'); }}>
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-3.88-7.44M21 3v6h-6" />
               </svg>
               <span className="text-white font-medium text-sm">Retrieve Lost QR Code</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
