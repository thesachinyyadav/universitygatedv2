import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <main className="flex-1">
        <section className="relative px-3 pt-3 pb-0 sm:px-4 sm:pt-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl text-white shadow-[0_24px_60px_-15px_rgba(4,10,30,0.65)]"
            style={{
              backgroundImage:
                'radial-gradient(130% 100% at 0% 0%, #2f6ce8 0%, transparent 55%), radial-gradient(130% 100% at 100% 100%, #030813 0%, transparent 60%), linear-gradient(160deg, #1e47b8 0%, #102a78 35%, #0b1730 75%, #060e1c 100%)',
            }}
          >
            <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[#3a7bff]/30 blur-3xl" />
            <div className="pointer-events-none absolute top-32 -left-20 h-64 w-64 rounded-full bg-[#0a1f5c]/60 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }} />

            <div className="relative px-5 sm:px-7 py-7 sm:py-9">
              <div className="flex flex-col items-center text-center gap-4">
                <Image
                  src="/christunilogo.png"
                  alt="Christ University"
                  width={220}
                  height={72}
                  className="h-12 w-auto object-contain"
                  style={{ filter: 'brightness(0) invert(1) drop-shadow(0 3px 8px rgba(0,0,0,0.45))' }}
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Gated Access Management</h1>
                </div>
                <p className="text-sm sm:text-base text-white/80 max-w-xl">
                  Secure, efficient entry management for events and campus access.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/on-spot-registration"
                  className="flex-1 px-5 py-3.5 bg-[#C9A84C] hover:bg-[#d8b860] text-[#0d245f] text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  On-Spot Registration
                </Link>
                <Link
                  href="/retrieve-qr"
                  className="flex-1 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl border border-white/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6v6H3V7zm12 0h6v6h-6V7zM3 17h6v4H3v-4zm12 0h6v4h-6v-4z" />
                  </svg>
                  Retrieve Lost QR Code
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="bg-[#F4F6FB] pb-10 sm:pb-12 text-[#1f2f57]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <h2 className="text-lg sm:text-2xl font-bold text-[#1f2f57]">Seamless Entry in 4 Steps</h2>
              </div>
              <p className="text-[10px] sm:text-[11px] font-normal text-[#9ca3af] mt-1.5">Simple, secure and streamlined</p>
            </div>

            <div className="mt-5 sm:mt-7">
              <div className="relative pl-10 sm:pl-14 space-y-4">
                <div
                  className="absolute left-[1.125rem] sm:left-[1.625rem] top-3 bottom-3 w-0 border-l-[2.5px] border-dashed border-[#2b4fa8]/70"
                />
                {[
                  {
                    step: '1',
                    title: 'Request Access',
                    text: 'Fill in your details and arrival time in the portal.',
                    icon: (
                      <svg className="w-7 h-7 text-[#2b4fa8]" fill="none" stroke="currentColor" strokeWidth={2.25} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zM4 20a8 8 0 0116 0" />
                      </svg>
                    ),
                  },
                  {
                    step: '2',
                    title: 'Instant Verification',
                    text: 'System checks credentials against the university database.',
                    icon: (
                      <svg className="w-7 h-7 text-[#2b4fa8]" fill="none" stroke="currentColor" strokeWidth={2.25} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V7l7-4z" />
                      </svg>
                    ),
                  },
                  {
                    step: '3',
                    title: 'Receive QR Pass',
                    text: 'Your digital gate pass is sent to your registered email or phone.',
                    icon: (
                      <svg className="w-7 h-7 text-[#2b4fa8]" fill="none" stroke="currentColor" strokeWidth={2.25} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm8 2h2m4 0h2m-6-2h2m4 0h2" />
                      </svg>
                    ),
                  },
                  {
                    step: '4',
                    title: 'Easy Entry',
                    text: 'Scan at any gate reader for immediate campus access.',
                    icon: (
                      <svg className="w-7 h-7 text-[#2b4fa8]" fill="none" stroke="currentColor" strokeWidth={2.25} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3M3 12h18" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <div key={item.step} className="relative flex items-center gap-4 sm:gap-5">
                    <div className="absolute -left-10 sm:-left-14 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-[#2b4fa8] border-2 border-white text-white font-bold text-sm flex items-center justify-center shadow-[0_4px_10px_rgba(43,79,168,0.45)] ring-2 ring-[#2b4fa8]/30">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl shadow-[0_6px_18px_-8px_rgba(15,47,117,0.25)] border border-[#e0e7ff] border-l-4 border-l-[#2b4fa8] px-4 sm:px-5 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#eaf0ff] ring-1 ring-[#2b4fa8]/15 flex items-center justify-center flex-shrink-0">
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
