import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5 sm:pt-5 sm:pb-6">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] p-5 sm:p-8">
            <Image
              src="/securityimage.jpg"
              alt="University campus entrance"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/45 to-primary-900/45" />

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl">
              <h1 className="text-white text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
                Secure Campus Entry
                <br />
                for Every Visit
              </h1>
              <p className="text-slate-100/95 text-sm sm:text-base lg:text-lg mb-6 max-w-2xl">
                A modern access gateway for visitors, security teams, and event organisers with trusted verification, instant passes, and smooth campus flow.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/on-spot-registration" className="px-5 py-3.5 bg-primary-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-900/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  On-Spot Registration
                </Link>

                <Link href="/retrieve-qr" className="px-5 py-3.5 bg-white/10 backdrop-blur-md text-white text-sm border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v2m0 8v2a2 2 0 002 2h2m8 0h2a2 2 0 002-2v-2m0-8V6a2 2 0 00-2-2h-2M8 8h8v8H8V8z" />
                  </svg>
                  Retrieve Lost QR Code
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 max-w-xl">
                {[
                  { value: '24/7', label: 'Verification' },
                  { value: '<2m', label: 'Avg Pass Time' },
                  { value: '100%', label: 'Digital Flow' },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-center backdrop-blur-sm">
                    <p className="text-white text-base sm:text-lg font-extrabold leading-none">{item.value}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-200 uppercase tracking-wide mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-primary-50 py-7 sm:py-9">
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
