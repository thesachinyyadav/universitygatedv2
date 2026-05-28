import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from '@/components/QRScanner';
import ManualEntry from '@/components/ManualEntry';
import type { Visitor } from '@/types/database';
import { broadcastDisplayEvent, primeDisplaySender } from '@/lib/displayEvents';

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

const ITEMS_PER_PAGE = 10;

export default function GuardDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Partial<Visitor> | null>(null);
  const [notification, setNotification] = useState<NotificationProps | null>(null);
  const [isViewingAll, setIsViewingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [scanCount, setScanCount] = useState(0);

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
    primeDisplaySender();
  }, [router]);

  const handleScan = async (visitorId: string) => {
    if (isVerifying) return;
    setIsVerifying(true);

    try {
      const guardUsername = user?.username || 'unknown';
      const response = await fetch(
        `/api/verifyVisitor?id=${encodeURIComponent(visitorId)}&guard_username=${encodeURIComponent(guardUsername)}`
      );
      const data = await response.json();

      if (data.verified && data.visitor?.name) {
        broadcastDisplayEvent({ type: 'success', name: data.visitor.name });
        setScanCount(prev => prev + 1);
      } else if (!data.visitor) {
        broadcastDisplayEvent({ type: 'invalid' });
      } else {
        broadcastDisplayEvent({ type: 'denied', reason: data.dateError });
      }

      setNotification({
        verified: data.verified,
        visitorName: data.visitor?.name,
        dateError: data.dateError,
      });
      setTimeout(() => setNotification(null), 4000);

      setScanHistory(prev =>
        [{ id: visitorId, timestamp: new Date(), verified: data.verified, visitor: data.visitor }, ...prev].slice(0, 100)
      );
    } catch {
      broadcastDisplayEvent({ type: 'invalid' });
      setNotification({ verified: false });
      setTimeout(() => setNotification(null), 4000);
      setScanHistory(prev =>
        [{ id: visitorId, timestamp: new Date(), verified: false }, ...prev].slice(0, 100)
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login?role=guard');
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const renderAllScansModal = () => (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      <header className="flex items-center justify-between px-4 h-14 border-b border-[#F1F5F9]">
        <button
          onClick={() => setIsViewingAll(false)}
          className="p-2 -ml-2 text-[#0F172A]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-[16px] font-bold text-[#0F172A]">All Scans</h2>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col">
          {scanHistory
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            .map((item, i) => {
              const colorClass = item.verified
                ? 'bg-[#D1FAE5] text-[#10B981]'
                : 'bg-[#FEE2E2] text-[#EF4444]';
              const label = item.verified ? 'Verified' : item.visitor ? 'Denied' : 'Invalid';
              const iconEl = item.verified ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              );

              return (
                <div
                  key={`${item.id}-${i}`}
                  className="flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-0"
                  onClick={() => item.visitor && setSelectedVisitor(item.visitor as Visitor)}
                >
                  <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${colorClass}`}>
                      {item.visitor?.name ? getInitials(item.visitor.name) : '?'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-[#0F172A] truncate">
                        {item.visitor?.name || 'Unknown'}
                      </span>
                      <span className="text-[12px] font-medium text-[#64748B]">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${colorClass}`}>
                    {iconEl} {label}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {scanHistory.length > ITEMS_PER_PAGE && (
        <div className="p-4 border-t border-[#F1F5F9] bg-white flex items-center justify-between">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 text-[13px] font-bold text-[#011F7B] disabled:opacity-30 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Previous
          </button>
          <span className="text-[13px] font-bold text-[#64748B]">
            Page {currentPage} of {Math.ceil(scanHistory.length / ITEMS_PER_PAGE)}
          </span>
          <button
            disabled={currentPage >= Math.ceil(scanHistory.length / ITEMS_PER_PAGE)}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 text-[13px] font-bold text-[#011F7B] disabled:opacity-30 flex items-center gap-2"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <div className="scan-page">
      {/* ── White TopBar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]">
        <div className="relative flex items-center px-4 h-14">
          {/* Left: Guard avatar */}
          <div className="flex-1 flex justify-start">
            <div className="w-[34px] h-[34px] rounded-full bg-[#011F7B] flex items-center justify-center ring-[2.5px] ring-[#000103] shadow-sm">
              <span className="text-[13px] font-black text-white">
                {getInitials(user.name || user.username || 'G')}
              </span>
            </div>
          </div>

          {/* Center: brand */}
          <span className="absolute left-1/2 -translate-x-1/2 text-[18px] font-black tracking-tight text-[#011F7B]">
            GATED
          </span>

          {/* Right: logout */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleLogout}
              className="text-[#64748B] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Navy Header ── */}
      <div className="bg-[#011F7B] px-4 pt-4 pb-32 relative z-10 w-full flex-shrink-0 rounded-b-[40px]">
        <div className="flex flex-col gap-3 max-w-[480px] mx-auto">
          {/* Row 1: title + scan count */}
          <div className="flex items-center justify-between w-full gap-2">
            <h1 className="text-white text-[17px] font-bold leading-tight flex-1">
              Security Guard
            </h1>
            <div className="flex-shrink-0 border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.08)] rounded-[12px] px-3 py-1 text-white text-[11px] font-semibold whitespace-nowrap">
              {scanCount} verified
            </div>
          </div>

          {/* Row 2: guard metadata */}
          <div className="flex items-center gap-2 text-[10px] text-[#cbd5e1] font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {user.name || user.username}
            </span>
            <span className="w-[3px] h-[3px] rounded-full bg-[#94A3B8]" />
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Gate Access Control
            </span>
            {isVerifying && (
              <>
                <span className="w-[3px] h-[3px] rounded-full bg-[#94A3B8]" />
                <span className="flex items-center gap-1.5 text-[#FFBA09]">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#FFBA09] animate-pulse" />
                  Verifying…
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Overlapping main content ── */}
      <div className="px-3 -mt-20 relative z-20 pb-24 max-w-[480px] mx-auto w-full flex flex-col gap-4">

        {/* Scanner card */}
        <QRScanner onScan={handleScan} />

        {/* Recent Scans section */}
        <section className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_4px_24px_rgba(15,23,42,0.03)] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F8FAFC]">
            <h3 className="text-[12px] font-bold text-[#0F172A] tracking-wider uppercase flex items-center gap-2">
              RECENT SCANS
              {isVerifying && (
                <span className="text-[#F59E0B] text-[9px]">● verifying</span>
              )}
            </h3>
            {scanHistory.length > 0 && (
              <button
                onClick={() => { setCurrentPage(1); setIsViewingAll(true); }}
                className="text-[12px] font-bold text-[#011F7B] hover:opacity-70 transition-opacity"
              >
                View all ({scanHistory.length})
              </button>
            )}
          </div>

          <div className="flex flex-col">
            {scanHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-[#94A3B8]">
                <svg className="w-7 h-7 mb-1.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[12px] font-medium">No scans yet</span>
              </div>
            ) : (
              scanHistory.slice(0, 5).map((item, i) => {
                const colorClass = item.verified
                  ? 'bg-[#D1FAE5] text-[#10B981]'
                  : 'bg-[#FEE2E2] text-[#EF4444]';
                const label = item.verified ? 'Verified' : item.visitor ? 'Denied' : 'Invalid';
                const iconEl = item.verified ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                );

                return (
                  <motion.div
                    key={`${item.id}-${item.timestamp.getTime()}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-between py-3 px-4 border-b border-[#F8FAFC] last:border-0 cursor-pointer"
                    onClick={() => item.visitor && setSelectedVisitor(item.visitor as Visitor)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${colorClass}`}>
                        {item.visitor?.name ? getInitials(item.visitor.name) : '?'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] font-bold text-[#0F172A] truncate">
                          {item.visitor?.name || 'Unknown visitor'}
                        </span>
                        <span className="text-[12px] font-medium text-[#64748B] truncate">
                          {item.visitor?.event_name || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${colorClass}`}>
                        {iconEl} {label}
                      </div>
                      <span className="text-[11px] font-medium text-[#94A3B8] tabular-nums">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[#CBD5E1] text-[16px]">›</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* Manual Entry */}
        <ManualEntry onVerify={handleScan} />
      </div>

      {/* ── All Scans Modal ── */}
      <AnimatePresence>
        {isViewingAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {renderAllScansModal()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Visitor Details Modal ── */}
      <AnimatePresence>
        {selectedVisitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVisitor(null)}
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto"
            >
              <div className="bg-[#011F7B] text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-[16px] font-bold">Visitor Details</h2>
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5">
                <div className="flex justify-center mb-5">
                  {selectedVisitor.photo_url ? (
                    <img
                      src={selectedVisitor.photo_url}
                      alt={selectedVisitor.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#E0E7FF] shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#E0E7FF] flex items-center justify-center border-4 border-[#C7D2FE]">
                      <span className="text-[28px] font-black text-[#011F7B]">
                        {getInitials(selectedVisitor.name || '?')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Name</label>
                    <p className="text-[16px] font-bold text-[#0F172A] mt-0.5">{selectedVisitor.name}</p>
                  </div>

                  {selectedVisitor.register_number && (
                    <div className="bg-[#EEF2FF] -mx-5 px-5 py-3 border-l-4 border-[#011F7B]">
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">ID Number</p>
                      <p className="text-[22px] font-black text-[#011F7B] font-mono tracking-wide">
                        {selectedVisitor.register_number}
                      </p>
                    </div>
                  )}

                  {selectedVisitor.event_name && (
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Event</label>
                      <p className="text-[14px] text-[#374151] mt-0.5">{selectedVisitor.event_name}</p>
                    </div>
                  )}

                  {selectedVisitor.email && (
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Email</label>
                      <p className="text-[14px] text-[#374151] mt-0.5">{selectedVisitor.email}</p>
                    </div>
                  )}

                  {selectedVisitor.phone && (
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Phone</label>
                      <p className="text-[14px] text-[#374151] mt-0.5">{selectedVisitor.phone}</p>
                    </div>
                  )}

                  {selectedVisitor.visitor_category && (
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Category</label>
                      <p className="text-[14px] text-[#374151] mt-0.5 capitalize">{selectedVisitor.visitor_category}</p>
                    </div>
                  )}

                  {(selectedVisitor.date_of_visit_from || selectedVisitor.date_of_visit) && (
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Visit Date</label>
                      <p className="text-[14px] text-[#374151] mt-0.5">
                        {selectedVisitor.date_of_visit_from && selectedVisitor.date_of_visit_to
                          ? `${new Date(selectedVisitor.date_of_visit_from).toLocaleDateString()} – ${new Date(selectedVisitor.date_of_visit_to).toLocaleDateString()}`
                          : selectedVisitor.date_of_visit
                          ? new Date(selectedVisitor.date_of_visit).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  )}

                  {selectedVisitor.purpose && (
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Purpose</label>
                      <p className="text-[14px] text-[#374151] mt-0.5">{selectedVisitor.purpose}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status</label>
                    <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-[12px] font-bold ${
                      selectedVisitor.status === 'approved'
                        ? 'bg-[#D1FAE5] text-[#10B981]'
                        : selectedVisitor.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-[#FEE2E2] text-[#EF4444]'
                    }`}>
                      {selectedVisitor.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="mt-5 w-full bg-[#011F7B] hover:bg-[#1E3FAB] text-white font-semibold py-3 rounded-[12px] transition text-[14px] active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.25 }}
            className="fixed top-4 right-4 z-[200] max-w-[320px] min-w-[220px]"
          >
            <div className={`rounded-[14px] shadow-2xl border overflow-hidden ${
              notification.verified
                ? 'bg-[#F0FDF4] border-[#86EFAC]'
                : 'bg-[#FFF1F2] border-[#FECDD3]'
            }`}>
              <div className="px-4 py-3 flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.verified ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEE2E2] text-[#EF4444]'
                }`}>
                  {notification.verified ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold ${notification.verified ? 'text-[#14532D]' : 'text-[#7F1D1D]'}`}>
                    {notification.verified ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </p>
                  {notification.visitorName && (
                    <p className="text-[12px] text-[#374151] mt-0.5 truncate">{notification.visitorName}</p>
                  )}
                  {!notification.verified && notification.dateError && (
                    <p className="text-[11px] text-[#B91C1C] mt-0.5 font-medium">{notification.dateError}</p>
                  )}
                  {!notification.verified && !notification.visitorName && !notification.dateError && (
                    <p className="text-[12px] text-[#374151] mt-0.5">QR code not recognized</p>
                  )}
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className={`flex-shrink-0 rounded-full p-1 transition ${
                    notification.verified ? 'text-[#16A34A] hover:bg-[#D1FAE5]' : 'text-[#DC2626] hover:bg-[#FEE2E2]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                className={`h-[3px] ${notification.verified ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
