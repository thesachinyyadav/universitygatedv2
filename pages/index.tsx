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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="relative overflow-hidden rounded-2xl min-h-[320px] sm:min-h-[360px] flex flex-col items-center justify-center text-center p-5 sm:p-6">
            <Image
              src="/securityimage.jpg"
              alt="University campus entrance"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-tertiary-600 text-slate-900 text-[11px] font-bold uppercase tracking-wider mb-3">
                GATED · Powered by SOCIO
              </span>
              <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-4">
                Secure Campus Entry
                <br />
                at Your Fingertips
              </h1>
              <p className="text-slate-200 text-sm sm:text-base mb-5">
                Streamlined digital access for students, faculty, and verified guests. Enter safely and efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/visitor-register" className="px-5 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Request Entry Access
                </Link>

                <Link href="/retrieve-qr" className="px-5 py-3 bg-white/10 backdrop-blur-md text-white text-sm border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v2m0 8v2a2 2 0 002 2h2m8 0h2a2 2 0 002-2v-2m0-8V6a2 2 0 00-2-2h-2M8 8h8v8H8V8z" />
                  </svg>
                  Retrieve Lost QR Code
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary-600 rounded-full" />
              Quick Services
            </h2>
            <Link href="/visitor-register" className="text-primary-700 font-semibold text-sm hover:underline">View all services</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {quickServices.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-primary-400 transition-all shadow-sm"
              >
                <div className="w-11 h-11 bg-primary-50 rounded-lg flex items-center justify-center text-primary-700 mb-3 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-1">{service.title}</h3>
                <p className="text-slate-500 text-sm mb-3">{service.description}</p>
                <div className="flex items-center text-primary-700 font-bold text-sm">
                  Open Service
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-primary-50 py-7 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">Seamless Entry in 4 Steps</h2>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-slate-300" />

              {[
                { step: '1', title: 'Request Access', text: 'Fill in your details and arrival time in the portal.' },
                { step: '2', title: 'Instant Verification', text: 'System checks credentials against the university database.' },
                { step: '3', title: 'Receive QR Pass', text: 'Your digital gate pass is sent to your registered email or phone.' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-primary-700 font-black text-base mb-2 border-2 border-primary-600 relative z-10">
                    {item.step}
                  </div>
                  <h4 className="font-bold mb-1 text-sm sm:text-base">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-500">{item.text}</p>
                </div>
              ))}

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full shadow-lg flex items-center justify-center text-white mb-2 relative z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold mb-1 text-sm sm:text-base text-primary-700">Easy Entry</h4>
                <p className="text-xs sm:text-sm text-slate-500">Scan at any gate reader for immediate campus access.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
