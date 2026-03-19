import Link from 'next/link';
import Image from 'next/image';

export default function FooterHolder() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3">
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
