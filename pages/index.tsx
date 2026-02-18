import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-blue-400/10 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl mx-auto text-center"
        >
          {/* Main Content */}
          <motion.div variants={itemVariants} className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full transform scale-150 opacity-50"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl inline-flex items-center justify-center">
              <Image
                src="/christunilogo.png"
                alt="Christ University"
                width={200}
                height={60}
                className="h-16 w-auto object-contain brightness-0 invert opacity-90"
              />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm"
          >
            Christ University
            <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 font-medium text-tertiary-200">
              Gated Access System
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Streamlined security and seamless campus entry for students, visitors, and faculty.
            Experience the next generation of campus access.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/visitor-register" className="w-full sm:w-auto">
              <Button
                size="xl"
                variant="white"
                rightIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
                className="w-full sm:w-auto shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ring-2 ring-white/50"
              >
                Get Visitor Pass
              </Button>
            </Link>

            <Link href="/retrieve-qr" className="w-full sm:w-auto">
              <Button
                size="xl"
                variant="glass"
                className="w-full sm:w-auto hover:bg-white/10 border-white/30 text-white"
              >
                Retrieve QR Code
              </Button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left"
          >
            {[
              {
                icon: (
                  <svg className="w-6 h-6 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                ),
                title: "Instant QR Access",
                desc: "Generate entry passes in seconds."
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Digital Verification",
                desc: "Contactless and secure validation."
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Campus Safety",
                desc: "Enhanced security for everyone."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-primary-200 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="absolute bottom-4 left-0 w-full text-center"
        >
          <p className="text-primary-300/60 text-xs tracking-widest uppercase">
            © 2025 Christ University • Excellence and Service
          </p>
        </motion.div>
      </div>
    </div>
  );
}
