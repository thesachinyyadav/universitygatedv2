import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b57d1] via-[#1444A3] to-[#0f2f75] text-white">
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute -top-28 -right-24 h-64 w-64 rounded-full bg-[#1e56c2]/40 blur-3xl" />
          <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-[#1a4db6]/40 blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-6 sm:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white/6 border border-white/15 backdrop-blur-sm px-5 sm:px-7 py-6 sm:py-8 shadow-[0_20px_60px_rgba(6,14,40,0.45)]"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="rounded-2xl bg-white px-4 py-2 shadow-lg">
                  <Image
                    src="/christunilogo.png"
                    alt="Christ University"
                    width={200}
                    height={64}
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">Christ University</p>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Gated Access Management</h1>
                </div>
                <p className="text-sm sm:text-base text-white/75 max-w-xl">
                  Secure, efficient entry management for events and campus access.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/on-spot-registration"
                  className="flex-1 px-5 py-3 bg-[#f2d27a] hover:bg-[#f7dd98] text-[#1a2a54] text-sm font-semibold rounded-xl shadow-lg shadow-[#16285b]/45 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Request Entry Access
                </Link>

                <Link
                  href="/retrieve-qr"
                  className="flex-1 px-5 py-3 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6v6H3V7zm12 0h6v6h-6V7zM3 17h6v4H3v-4zm12 0h6v4h-6v-4z" />
                  </svg>
                  Retrieve Lost QR Code
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-[#1b57d1] via-[#1444A3] to-[#0f2f75] pb-10 sm:pb-12 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <span className="h-0.5 w-8 sm:w-12 rounded-full bg-[#f2c55c]" />
                <h2 className="text-lg sm:text-2xl font-bold">Seamless Entry in 4 Steps</h2>
                <span className="h-0.5 w-8 sm:w-12 rounded-full bg-[#f2c55c]" />
              </div>
              <p className="text-xs sm:text-sm text-white/85 mt-2">Simple, secure and streamlined</p>
            </div>

            <div className="mt-6 sm:mt-8">
              <div className="relative pl-10 sm:pl-14 space-y-4">
                <div className="absolute left-4 sm:left-6 top-3 bottom-3 w-px bg-[#c8d7fb]" />
                {[
                  {
                    step: '1',
                    title: 'Request Access',
                    text: 'Fill in your details and arrival time in the portal.',
                    icon: (
                      <svg className="w-6 h-6 text-[#2b4fa8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zM4 20a8 8 0 0116 0" />
                      </svg>
                    ),
                  },
                  {
                    step: '2',
                    title: 'Instant Verification',
                    text: 'System checks credentials against the university database.',
                    icon: (
                      <svg className="w-6 h-6 text-[#1aa878]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V7l7-4z" />
                      </svg>
                    ),
                  },
                  {
                    step: '3',
                    title: 'Receive QR Pass',
                    text: 'Your digital gate pass is sent to your registered email or phone.',
                    icon: (
                      <svg className="w-6 h-6 text-[#7b61ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm8 2h2m4 0h2m-6-2h2m4 0h2" />
                      </svg>
                    ),
                  },
                  {
                    step: '4',
                    title: 'Easy Entry',
                    text: 'Scan at any gate reader for immediate campus access.',
                    icon: (
                      <svg className="w-6 h-6 text-[#1aa878]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <div key={item.step} className="relative flex items-center gap-4 sm:gap-5">
                    <div className="absolute -left-10 sm:-left-14 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-[#2b4fa8] text-[#2b4fa8] font-bold text-sm flex items-center justify-center shadow-sm">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#e0e7ff] px-4 sm:px-5 py-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#f3f6ff] flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-[#1f2f57]">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-[#5b6a8a] mt-1">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
