import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { QuickActionCard } from '@/components/ui/Card';

export default function Home() {
  const features = [
    {
      title: 'Quick Register',
      description: 'Register for events in seconds with instant QR code generation',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Scan & Verify',
      description: 'Fast contactless entry with real-time QR code verification',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      title: 'Secure Access',
      description: 'Enterprise-grade security with encrypted QR codes and data protection',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  const steps = [
    { number: 1, title: 'Register', description: 'Fill quick form with event details' },
    { number: 2, title: 'Download', description: 'Get your unique QR pass instantly' },
    { number: 3, title: 'Enter', description: 'Show at gate for contactless entry' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      {/* Hero Section */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white mb-8 sm:mb-12"
        >
          {/* Logo + Title */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
            <motion.div 
              className="h-16 sm:h-20 md:h-24 bg-white rounded-2xl px-4 sm:px-6 py-3 shadow-2xl flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src="/christunilogo.png"
                alt="Christ University"
                width={200}
                height={60}
                className="h-full w-auto object-contain"
                priority
              />
            </motion.div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">
                Christ University
              </h1>
              <h2 className="text-base sm:text-lg md:text-xl font-light text-white/90">
                Gated Access Management System
              </h2>
            </div>
          </div>

          {/* Tagline */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8 px-4"
          >
            Secure, efficient, and seamless entry management for events and campus access
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto px-4"
          >
            <Link href="/visitor-register" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-tertiary-600 hover:bg-tertiary-700 text-white font-bold text-base sm:text-lg px-8 py-4 rounded-xl inline-flex items-center justify-center space-x-3 shadow-2xl transition-all"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Request Entry Access</span>
              </motion.button>
            </Link>

            <Link href="/retrieve-qr" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center space-x-2 border-2 border-white/40 hover:border-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Retrieve QR Code</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-8 sm:mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <QuickActionCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto card bg-white/95 backdrop-blur p-6 sm:p-8 md:p-10 mb-8 sm:mb-12"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-primary-600 mb-8">
            How It Works
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1 w-full md:w-auto">
                <div className="flex-1 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, type: 'spring' }}
                    className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 shadow-lg"
                  >
                    {step.number}
                  </motion.div>
                  <h4 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">
                    {step.title}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center px-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Image Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto mb-8 sm:mb-12"
        >
          <div className="card overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="relative w-full h-48 sm:h-64 md:h-80">
              <Image
                src="/securityimage.jpg"
                alt="Campus Security"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 bg-white">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 mb-3">
                Campus Safety & Security
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
                Christ University is committed to providing a safe and secure environment for all students, 
                faculty, staff, and visitors. Our advanced gated access management system ensures controlled 
                entry while maintaining a welcoming campus atmosphere.
              </p>
              <a
                href="https://christuniversity.in/view-pdf/safety-and-security-of-students-on-campus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors text-sm sm:text-base group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>View Full Safety Policy</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/80 text-xs sm:text-sm"
        >
          <p>© {new Date().getFullYear()} Christ University. All rights reserved.</p>
          <p className="mt-1">Secure Gated Access Management System</p>
        </motion.div>
      </div>
    </div>
  );
}
