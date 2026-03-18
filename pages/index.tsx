import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const quickServices = [
  {
    title: 'Quick Register',
    description: 'Instant visitor onboarding',
    href: '/visitor-register',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3M5 20h7a2 2 0 002-2v-1a5 5 0 00-5-5H7a5 5 0 00-5 5v1a2 2 0 002 2zm7-14a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Scan & Verify',
    description: 'Fast QR verification',
    href: '/verify',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V4h3M4 17v3h3m10-16h3v3m0 10v3h-3M9 7h6v10H9V7z" />
      </svg>
    ),
  },
  {
    title: 'Secure Access',
    description: 'End-to-end safety flow',
    href: '/retrieve-qr',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1V9a3 3 0 116 0v2m-5 0h6m-8 0h10a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary-600 rounded-lg flex items-center justify-center text-white overflow-hidden">
              <Image
                src="/socio.svg"
                alt="SOCIO logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-gray-900">SOCIO GATED</h1>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Powered by SOCIO</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full pb-24">
        <section className="px-4 py-6">
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6 shadow-sm border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <Image
              src="/securityimage.jpg"
              alt="University gate security"
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 z-20 text-white">
              <h2 className="text-xl font-bold">Secure Campus Entry</h2>
              <p className="text-xs text-gray-200">Digital verification for a safer community</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/visitor-register" className="block">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="w-full bg-tertiary-600 hover:bg-tertiary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-tertiary-600/20 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Request Entry Access</span>
              </motion.div>
            </Link>

            <Link
              href="/retrieve-qr"
              className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v2m0 8v2a2 2 0 002 2h2m8 0h2a2 2 0 002-2v-2m0-8V6a2 2 0 00-2-2h-2M8 8h8v8H8V8z" />
              </svg>
              <span>Retrieve Lost QR Code</span>
            </Link>
          </div>
        </section>

        <section className="px-4 mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Services</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickServices.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center text-center gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="size-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  {service.icon}
                </div>
                <span className="text-[11px] font-bold text-gray-700 leading-tight">{service.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 py-6 bg-primary-50 rounded-t-[2rem] border-t border-primary-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">How It Works</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold z-10">1</div>
                <div className="w-0.5 h-full bg-primary-200 -mt-1" />
              </div>
              <div className="pb-2">
                <h4 className="font-bold text-gray-800 text-sm">Submit Request</h4>
                <p className="text-xs text-gray-500 mt-1">Fill in your basic details and entry purpose for validation.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold z-10">2</div>
                <div className="w-0.5 h-full bg-primary-200 -mt-1" />
              </div>
              <div className="pb-2">
                <h4 className="font-bold text-gray-800 text-sm">Receive QR Code</h4>
                <p className="text-xs text-gray-500 mt-1">Once approved, a secure digital pass is sent to your device.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold z-10">3</div>
              </div>
              <div className="pb-2">
                <h4 className="font-bold text-gray-800 text-sm">Scan & Enter</h4>
                <p className="text-xs text-gray-500 mt-1">Scan the QR code at the gate terminal for instant access.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-6 text-center">
          <p className="text-xs text-gray-500">Powered by <span className="font-semibold text-primary-700">SOCIO</span></p>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto flex gap-2 px-4 pb-4 pt-2">
          <Link href="/" className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl text-primary-600">
            <div className="flex h-8 items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 1.293a1 1 0 00-1.414 0l-8 8A1 1 0 002 11h1v6a1 1 0 001 1h4a1 1 0 001-1V13h2v4a1 1 0 001 1h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-8-8z" />
              </svg>
            </div>
            <p className="text-[10px] font-bold leading-normal uppercase">Home</p>
          </Link>
          <Link href="/visitor-register" className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400">
            <div className="flex h-8 items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m8 4H4a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l9.414 9.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[10px] font-medium leading-normal uppercase">Requests</p>
          </Link>
          <Link href="/retrieve-qr" className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400">
            <div className="flex h-8 items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h6v6H3V4zm12 0h6v6h-6V4zM3 14h6v6H3v-6zm8 0h2m2 0h6m-6 0v6" />
              </svg>
            </div>
            <p className="text-[10px] font-medium leading-normal uppercase">Retrieve</p>
          </Link>
          <Link href="/login" className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-400">
            <div className="flex h-8 items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-[10px] font-medium leading-normal uppercase">Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
