import Link from 'next/link';
import Image from 'next/image';

export default function FooterHolder() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
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
