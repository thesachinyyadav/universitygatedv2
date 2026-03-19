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

  useEffect(() => {
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
  }, [router.pathname]);

  const dashboardHref =
    role === 'guard' ? '/guard' : role === 'organiser' ? '/organiser' : role === 'cso' ? '/cso' : '/login';

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setRole(null);
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
        {
          key: 'history',
          label: 'History',
          href: '/retrieve-qr',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-3.88-7.44M21 3v6h-6" />
            </svg>
          ),
        },
        {
          key: 'logout',
          label: 'Logout',
          onClick: handleLogout,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
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
        key: 'requests',
        label: 'Requests',
        href: '/visitor-register',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        ),
      },
      {
        key: 'history',
        label: 'History',
        href: '/retrieve-qr',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-3.88-7.44M21 3v6h-6" />
          </svg>
        ),
      },
      {
        key: 'profile',
        label: 'Profile',
        href: '/login',
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
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="md:hidden">
          <nav className="grid grid-cols-4 gap-1">
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

        <div className="hidden md:flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3">
            <Image src="/socio.svg" alt="SOCIO" width={24} height={24} className="w-6 h-6 opacity-75" />
            <span className="text-slate-500 text-xs sm:text-sm font-medium text-center md:text-left">
              © 2026 SOCIO Gated Access. Powered by SOCIO.
            </span>
          </div>

          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link href="/" className="text-slate-400 hover:text-primary-700 transition-colors">Privacy</Link>
            <Link href="/" className="text-slate-400 hover:text-primary-700 transition-colors">Security</Link>
            <Link href="/retrieve-qr" className="text-slate-400 hover:text-primary-700 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
