import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import type { Visitor } from '@/types/database';
import { Card, Button } from '@/components/ui';

export default function VerifyPage() {
  const router = useRouter();
  const { id } = router.query;
  const [visitor, setVisitor] = useState<Partial<Visitor> | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      verifyVisitor(id);
    }
  }, [id]);

  const verifyVisitor = async (visitorId: string) => {
    try {
      const response = await fetch(`/api/verifyVisitor?id=${visitorId}`);
      const data = await response.json();

      setIsVerified(data.verified);
      setVisitor(data.visitor);
    } catch (error) {
      console.error('Verification error:', error);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-sm w-full p-8 text-center bg-white shadow-xl rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying access credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] ${isVerified ? 'bg-green-500/10' : 'bg-red-500/10'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] ${isVerified ? 'bg-green-500/10' : 'bg-red-500/10'}`} />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className={`text-center p-0 overflow-hidden shadow-2xl ${isVerified ? 'border-green-100' : 'border-red-100'}`}>
          <div className={`p-6 ${isVerified ? 'bg-green-50' : 'bg-red-50'}`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${isVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
            >
              {isVerified ? (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </motion.div>

            <h1 className={`text-2xl font-black tracking-tight mb-1 ${isVerified ? 'text-green-700' : 'text-red-700'}`}>
              {isVerified ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
            </h1>
            <p className={`text-sm font-medium ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
              {isVerified ? 'Visitor verified successfully' : 'Invalid QR code or access revoked'}
            </p>
          </div>

          {isVerified && visitor && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 text-sm font-medium">Visitor Name</span>
                <span className="text-gray-900 font-bold text-lg">{visitor.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-left">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Category</p>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white capitalize"
                    style={{ backgroundColor: visitor.qr_color || '#254a9a' }}
                  >
                    {visitor.visitor_category || 'general'}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-left">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${visitor.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {visitor.status}
                  </span>
                </div>
              </div>

              {visitor.event_name && (
                <div className="p-3 bg-gray-50 rounded-xl text-left">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Event</p>
                  <p className="font-semibold text-gray-900">{visitor.event_name}</p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-xl text-left">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Valid Date</p>
                <p className="font-semibold text-gray-900">
                  {(visitor.date_of_visit && visitor.date_of_visit !== '')
                    ? new Date(visitor.date_of_visit).toLocaleDateString()
                    : (visitor.date_of_visit_from && visitor.date_of_visit_to)
                      ? `${new Date(visitor.date_of_visit_from).toLocaleDateString()} - ${new Date(visitor.date_of_visit_to).toLocaleDateString()}`
                      : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {!isVerified && (
            <div className="p-6">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                <p className="font-bold mb-1">Security Alert</p>
                <p>This QR code is not valid for entry. Please contact the security officer or event organiser for assistance.</p>
              </div>
            </div>
          )}

          <div className="p-6 pt-0">
            <Button onClick={() => router.push('/')} variant="outline" fullWidth>
              Return Home
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
