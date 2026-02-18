import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from '@/components/QRScanner';
import ManualEntry from '@/components/ManualEntry';
import type { Visitor } from '@/types/database';
import { Card, Button } from '@/components/ui';

interface ScanHistoryItem {
  id: string;
  timestamp: Date;
  verified: boolean;
  visitor?: Partial<Visitor>;
}

interface NotificationProps {
  verified: boolean;
  visitorName?: string;
  dateError?: string;
}

export default function GuardDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    visitor?: Partial<Visitor>;
    dateError?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Partial<Visitor> | null>(null);
  const [notification, setNotification] = useState<NotificationProps | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login?role=guard');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'guard') {
      router.push('/');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  const handleScan = async (visitorId: string) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const guardUsername = user?.username || 'unknown';
      console.log(`[GUARD] Verifying visitor ${visitorId} as guard: ${guardUsername}`);

      const response = await fetch(`/api/verifyVisitor?id=${encodeURIComponent(visitorId)}&guard_username=${encodeURIComponent(guardUsername)}`);
      const data = await response.json();

      console.log('[GUARD] Verification result:', data);

      setVerificationResult(data);

      // Show notification
      setNotification({
        verified: data.verified,
        visitorName: data.visitor?.name,
        dateError: data.dateError
      });

      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setNotification(null);
      }, 4000);

      // Add to scan history
      const historyItem: ScanHistoryItem = {
        id: visitorId,
        timestamp: new Date(),
        verified: data.verified,
        visitor: data.visitor
      };
      setScanHistory(prev => [historyItem, ...prev]); // Add to top of list

      // If manually verifying, switch to result view if needed or keep scanner open
      // For now, we show the result card

    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({ verified: false });

      // Show error notification
      setNotification({
        verified: false
      });

      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setNotification(null);
      }, 4000);

      // Add failed scan to history
      const historyItem: ScanHistoryItem = {
        id: visitorId,
        timestamp: new Date(),
        verified: false
      };
      setScanHistory(prev => [historyItem, ...prev]);

    } finally {
      setIsVerifying(false);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  const resetVerification = () => {
    setVerificationResult(null);
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-primary-800 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Security Console
            </h1>
            <p className="text-xs text-primary-200">User: {user.username}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${activeTab === 'scan' ? 'bg-white text-primary-800' : 'bg-primary-700 text-primary-200'}`}
            >
              Scanner
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${activeTab === 'history' ? 'bg-white text-primary-800' : 'bg-primary-700 text-primary-200'}`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-lg p-4 space-y-4">

        {/* Verification Result Overlay */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <Card className={`border-2 ${verificationResult.verified ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <div className="text-center p-4">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${verificationResult.verified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {verificationResult.verified ? (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>

                  <h2 className={`text-2xl font-black mb-2 ${verificationResult.verified ? 'text-green-800' : 'text-red-800'}`}>
                    {verificationResult.verified ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </h2>

                  {verificationResult.visitor ? (
                    <div className="bg-white/60 rounded-xl p-4 text-left space-y-2 mb-4">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Visitor</span>
                        <p className="text-lg font-bold text-gray-900">{verificationResult.visitor.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase">ID</span>
                          <p className="font-mono text-gray-800">{verificationResult.visitor.register_number || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase">Date</span>
                          <p className="font-mono text-gray-800">
                            {verificationResult.visitor.date_of_visit ? new Date(verificationResult.visitor.date_of_visit).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Event</span>
                        <p className="text-sm font-medium text-gray-800">{verificationResult.visitor.event_name}</p>
                      </div>
                      {verificationResult.verified && (
                        <div className="pt-2">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
                            VERIFIED ENTRY
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600 font-medium mb-4">{verificationResult.dateError || 'Invalid QR Code'}</p>
                  )}

                  <Button
                    onClick={resetVerification}
                    variant={verificationResult.verified ? 'primary' : 'outline'}
                    fullWidth
                    size="lg"
                  >
                    Scan Next Visitor
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Tabs */}
        {activeTab === 'scan' && !verificationResult && (
          <div className="space-y-6">
            <Card title="Scanner" className="overflow-hidden">
              <div className="bg-black relative rounded-lg overflow-hidden aspect-square sm:aspect-video">
                <QRScanner onScan={handleScan} />
                {isVerifying && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-white"></div>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Point camera at visitor's QR code
              </p>
            </Card>

            <Card title="Manual Entry">
              <ManualEntry onVerify={handleScan} />
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold text-gray-700">Recent Scans</h3>
              {scanHistory.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-600 font-semibold">Clear</button>
              )}
            </div>

            {scanHistory.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No scan history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-white p-3 rounded-lg border-l-4 shadow-sm flex items-center justify-between ${item.verified ? 'border-green-500' : 'border-red-500'}`}
                    onClick={() => item.visitor && setSelectedVisitor(item.visitor as Visitor)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.verified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {item.verified ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{item.visitor?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 text-ellipsis overflow-hidden whitespace-nowrap">{item.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {item.visitor && (
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Visitor Details Modal */}
      <AnimatePresence>
        {selectedVisitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVisitor(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card>
                <div className="text-center pt-2 pb-4">
                  {selectedVisitor.photo_url ? (
                    <img
                      src={selectedVisitor.photo_url}
                      alt={selectedVisitor.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary-100 mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center mb-4 text-2xl">
                      👤
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-primary-800">{selectedVisitor.name}</h3>
                  <p className="text-gray-500 text-sm">{selectedVisitor.visitor_category || 'Visitor'}</p>
                </div>

                <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Event</span>
                    <span className="font-semibold text-right">{selectedVisitor.event_name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-semibold">{selectedVisitor.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Reg No</span>
                    <span className="font-mono font-semibold">{selectedVisitor.register_number || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valid</span>
                    <span className="font-semibold text-green-600">
                      {selectedVisitor.date_of_visit_from ? new Date(selectedVisitor.date_of_visit_from).toLocaleDateString() : ''}
                      {' - '}
                      {selectedVisitor.date_of_visit_to ? new Date(selectedVisitor.date_of_visit_to).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button fullWidth onClick={() => setSelectedVisitor(null)}>
                    Close Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-4 right-4 z-40 flex justify-center pointer-events-none"
          >
            <div className={`shadow-2xl rounded-lg border px-6 py-4 flex items-center gap-4 pointer-events-auto ${notification.verified ? 'bg-white border-green-500' : 'bg-white border-red-500'}`}>
              <div className={`p-2 rounded-full ${notification.verified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {notification.verified ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <div>
                <h4 className={`font-bold ${notification.verified ? 'text-green-800' : 'text-red-800'}`}>
                  {notification.verified ? 'Access Granted' : 'Access Denied'}
                </h4>
                <p className="text-sm text-gray-600">{notification.visitorName || notification.dateError || 'Tap to dismiss'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
