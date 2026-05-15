import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center bg-gradient-to-br from-primary-50 via-white to-tertiary-50 px-6">
      {/* Top: CHRIST University logo */}
      <div className="pt-12 sm:pt-16">
        <Image
          src="/christunilogo.png"
          alt="CHRIST University"
          width={160}
          height={64}
          className="h-12 sm:h-14 w-auto"
          priority
        />
      </div>

      {/* Middle: GATED title + tagline + pulse dots */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-primary-700 tracking-tight mb-2">
            GATED
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            University Access Management
          </p>
        </div>

        <div className="flex justify-center space-x-2 mt-6">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay }}
              className="w-3 h-3 bg-primary-600 rounded-full"
            />
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400">Loading...</p>
      </div>

      {/* Bottom: Powered by SOCIO */}
      <div className="flex flex-col items-center gap-1 pb-10 sm:pb-12 text-slate-500">
        <p className="text-xs">Powered by</p>
        <Image
          src="/socio.svg"
          alt="SOCIO"
          width={90}
          height={26}
          className="h-6 w-auto"
        />
      </div>
    </div>
  );
}
