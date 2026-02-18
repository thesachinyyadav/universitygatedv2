import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      title: "Instant QR Access",
      desc: "Generate entry passes in seconds"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Secure Verification",
      desc: "Contactless and tamper-proof"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Campus Safety",
      desc: "Enhanced security for everyone"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary-600 via-primary-700 to-primary-800">
      {/* Main Content — takes up all available space */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        {/* Logo */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-2xl shadow-lg inline-flex items-center justify-center">
            <Image
              src="/christunilogo.png"
              alt="Christ University"
              width={160}
              height={48}
              className="h-10 w-auto object-contain brightness-0 invert"
              priority
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-tight mb-1"
        >
          Christ University
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-secondary-400 text-lg sm:text-xl font-semibold text-center mb-3"
        >
          Gated Access System
        </motion.p>

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-primary-200 text-sm text-center max-w-xs mb-8 leading-relaxed"
        >
          Streamlined security and seamless campus entry for students, visitors & faculty.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md mb-10"
        >
          <Link href="/visitor-register" className="flex-1">
            <Button
              size="lg"
              className="w-full bg-secondary-500 hover:bg-secondary-400 text-primary-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Get Visitor Pass
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>

          <Link href="/retrieve-qr" className="flex-1">
            <Button
              size="lg"
              variant="glass"
              className="w-full border-white/25 text-white font-semibold rounded-xl"
            >
              Retrieve QR Code
            </Button>
          </Link>
        </motion.div>

        {/* Features */}
        <div className="w-full max-w-md space-y-3">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              custom={5 + idx}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3"
            >
              <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center text-accent-300 shrink-0">
                {feature.icon}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{feature.title}</p>
                <p className="text-primary-300 text-xs">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer — in normal flow, no overlap */}
      <div className="py-4 text-center">
        <p className="text-primary-400/60 text-[10px] tracking-widest uppercase">
          © 2025 Christ University • Excellence and Service
        </p>
      </div>
    </div>
  );
}
