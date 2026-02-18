import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import QRGenerator from '../components/QRGenerator';
import { supabase } from '../lib/supabaseClient';
import { Button, Input, Card } from '@/components/ui';

export default function RetrieveQR() {
  const router = useRouter();
  const { id: urlVisitorId } = router.query;

  const [searchMethod, setSearchMethod] = useState<'email' | 'phone'>('email');
  const [searchValue, setSearchValue] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlVisitorId && typeof urlVisitorId === 'string') {
      handleRetrieve(urlVisitorId, 'id');
    }
  }, [urlVisitorId]);

  const handleRetrieve = async (value?: string, method?: string) => {
    const searchVal = value || searchValue;
    const searchMeth = method || searchMethod;

    if (!searchVal) {
      setError('Please enter your details');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let query = supabase.from('visitors').select('*');

      if (searchMeth === 'id') {
        query = query.eq('id', searchVal);
      } else if (searchMeth === 'email') {
        query = query.ilike('email', searchVal);
      } else if (searchMeth === 'phone') {
        query = query.ilike('phone', searchVal);
      }

      const { data, error: dbError } = await query.single();

      if (dbError || !data) {
        setError('No visitor found with that information. Please check and try again.');
        setLoading(false);
        return;
      }

      setVisitorId(data.id);
      setVisitorName(data.name);
      setShowQR(true);

    } catch (err) {
      console.error('[RETRIEVE_QR] Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowQR(false);
    setVisitorId('');
    setVisitorName('');
    setSearchValue('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-tertiary-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary-600/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {!showQR ? (
            <motion.div
              key="search-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="backdrop-blur-xl bg-white/95 border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner transform rotate-3">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Retrieve Pass</h1>
                  <p className="text-gray-500 text-sm">Enter your registered details to access your QR code</p>
                </div>

                <div className="flex bg-gray-100/50 p-1 rounded-xl mb-6 border border-gray-200">
                  <button
                    onClick={() => setSearchMethod('email')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${searchMethod === 'email'
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() => setSearchMethod('phone')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${searchMethod === 'phone'
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Phone</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <Input
                    label={searchMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    type={searchMethod === 'email' ? 'email' : 'text'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchMethod === 'email' ? 'john@example.com' : '+91 9876543210'}
                    error={error}
                    leftIcon={
                      searchMethod === 'email' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )
                    }
                  />

                  <Button
                    onClick={() => handleRetrieve()}
                    disabled={loading || !searchValue}
                    isLoading={loading}
                    fullWidth
                    size="lg"
                    variant="primary"
                    className="shadow-lg shadow-primary-500/30"
                  >
                    Retrieve Pass
                  </Button>
                </div>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                  <button
                    onClick={() => router.push('/')}
                    className="text-gray-500 hover:text-primary-600 font-medium text-sm flex items-center justify-center space-x-2 mx-auto transition-colors group"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Home</span>
                  </button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="qr-display"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="text-white/80 hover:text-white font-medium text-sm flex items-center space-x-2 transition-colors bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Check Another</span>
                </button>
              </div>

              <Card className="backdrop-blur-xl bg-white/95 border-white/20 shadow-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-tertiary-600 p-4 text-center">
                  <h2 className="text-white font-bold text-lg">Access Pass Retrieved</h2>
                  <p className="text-primary-100 text-xs">Present this QR code at the gate</p>
                </div>
                <div className="p-6">
                  <QRGenerator visitorId={visitorId} visitorName={visitorName} />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
