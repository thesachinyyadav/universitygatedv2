import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import type { Visitor } from '@/types/database';
import { Pagination } from '@/components/ui';

interface EventRequest {
  id: string;
  organiser_id: string;
  department: string;
  event_name: string;
  event_description: string;
  date_from: string;
  date_to: string;
  expected_students: number;
  max_capacity: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  source?: string;
  socio_event_id?: string;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

const statusBadgeMap: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  revoked: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
};

function getInitials(value: string) {
  if (!value) return 'NA';
  const parts = value.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatDateRange(from?: string, to?: string) {
  if (!from || !to) return 'N/A';
  return `${new Date(from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function CSODashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApprovingEvent, setIsApprovingEvent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'events' | 'visitors'>('events');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('');
  const [selectedRequestStatus, setSelectedRequestStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [eventPage, setEventPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [visitorPage, setVisitorPage] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login?role=cso');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'cso') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchVisitors();
    fetchEventRequests();
    fetchNotifications(parsedUser.id);
  }, [router]);

  const fetchEventRequests = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('event_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[CSO] Error fetching event requests:', error);
      } else {
        setEventRequests(requests || []);
      }
    } catch (error) {
      console.error('[CSO] Error fetching event requests:', error);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch(`/api/cso/notifications?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('[CSO] Error fetching notifications:', error);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch('/api/visitors');
      const data = await response.json();
      setVisitors(data.visitors || []);
    } catch (error) {
      console.error('[CSO] Error fetching visitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (visitorId: string, status: 'approved' | 'revoked') => {
    try {
      const response = await fetch('/api/updateStatus', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          status,
        }),
      });

      if (response.ok) {
        fetchVisitors();
      }
    } catch (error) {
      console.error('[CSO] Error updating status:', error);
    }
  };

  const markNotificationAsRead = async (relatedId: string) => {
    try {
      const notification = notifications.find((item) => item.related_id === relatedId);
      if (notification) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);

        if (error) {
          console.error('[CSO] Error marking notification as read:', error);
        }
      }
    } catch (error) {
      console.error('[CSO] Error marking notification as read:', error);
    }
  };

  const handleApproveEvent = async (requestId: string, approve: boolean) => {
    setIsApprovingEvent(requestId);
    try {
      const response = await fetch('/api/cso/approve-event', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          status: approve ? 'approved' : 'rejected',
          rejection_reason: approve ? null : rejectionReason[requestId],
          approved_by: user.id,
        }),
      });

      if (response.ok) {
        await markNotificationAsRead(requestId);
        fetchEventRequests();
        fetchNotifications(user.id);
        setRejectionReason((prev) => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }
    } catch (error) {
      console.error('[CSO] Error approving/rejecting event:', error);
    } finally {
      setIsApprovingEvent(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Event', 'Date', 'Status', 'Created'];
    const rows = visitors.map((visitor) => [
      visitor.name,
      visitor.email || '',
      visitor.phone || '',
      visitor.event_name || '',
      visitor.date_of_visit
        ? new Date(visitor.date_of_visit).toLocaleDateString('en-IN')
        : formatDateRange(visitor.date_of_visit_from, visitor.date_of_visit_to),
      visitor.status,
      new Date(visitor.created_at).toLocaleString('en-IN'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitors-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const unreadNotificationCount = notifications.filter((item) => !item.is_read).length;

  const stats = {
    total: visitors.length,
    pending: visitors.filter((visitor) => visitor.status === 'pending').length,
    approved: visitors.filter((visitor) => visitor.status === 'approved').length,
    revoked: visitors.filter((visitor) => visitor.status === 'revoked').length,
  };

  const eventRequestStats = {
    pending: eventRequests.filter((request) => request.status === 'pending').length,
    approved: eventRequests.filter((request) => request.status === 'approved').length,
    rejected: eventRequests.filter((request) => request.status === 'rejected').length,
  };

  const displayedRequests = selectedRequestStatus === 'all'
    ? eventRequests
    : eventRequests.filter((request) => request.status === selectedRequestStatus);
  const historyRequests = eventRequests.filter((request) => request.status !== 'pending');
  const filteredVisitors = visitors.filter((visitor) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      visitor.name.toLowerCase().includes(query) ||
      visitor.email?.toLowerCase().includes(query) ||
      visitor.event_name?.toLowerCase().includes(query) ||
      visitor.register_number?.toLowerCase().includes(query);

    const matchesEvent = !selectedEventFilter || visitor.event_name === selectedEventFilter;
    return matchesSearch && matchesEvent;
  });

  const eventPageSize = 4;
  const historyPageSize = 6;
  const visitorPageSize = 10;

  const totalEventPages = Math.max(1, Math.ceil(displayedRequests.length / eventPageSize));
  const totalHistoryPages = Math.max(1, Math.ceil(historyRequests.length / historyPageSize));
  const totalVisitorPages = Math.max(1, Math.ceil(filteredVisitors.length / visitorPageSize));

  const paginatedDisplayedRequests = displayedRequests.slice((eventPage - 1) * eventPageSize, eventPage * eventPageSize);
  const paginatedHistoryRequests = historyRequests.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);
  const paginatedVisitors = filteredVisitors.slice((visitorPage - 1) * visitorPageSize, visitorPage * visitorPageSize);

  const uniqueEvents = Array.from(new Set(visitors.map((visitor) => visitor.event_name).filter(Boolean))) as string[];

  useEffect(() => {
    setVisitorPage(1);
  }, [searchTerm, selectedEventFilter]);

  useEffect(() => {
    setEventPage(1);
  }, [selectedRequestStatus]);

  useEffect(() => {
    if (eventPage > totalEventPages) setEventPage(totalEventPages);
  }, [eventPage, totalEventPages]);

  useEffect(() => {
    if (historyPage > totalHistoryPages) setHistoryPage(totalHistoryPages);
  }, [historyPage, totalHistoryPages]);

  useEffect(() => {
    if (visitorPage > totalVisitorPages) setVisitorPage(totalVisitorPages);
  }, [visitorPage, totalVisitorPages]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 border-r border-slate-200 bg-white flex-col z-20">
        <div className="px-6 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold">CSO Dashboard</h1>
              <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                <span>Powered by</span>
                <Image
                  src="/socio.svg"
                  alt="SOCIO"
                  width={46}
                  height={13}
                  className="h-3 w-auto inline-block"
                />
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'events'
                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Events</span>
            {eventRequestStats.pending > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                {eventRequestStats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'visitors'
                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <span>Visitors</span>
          </button>
        </nav>


      </aside>

      <div className="lg:ml-72">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold leading-tight">{activeTab === 'events' ? 'Event Requests' : 'Visitor Management'}</h2>
                <p className="text-[11px] sm:text-xs text-slate-500">Welcome, {user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Go to Home"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5M5.25 9.75V20a1 1 0 001 1h4.5v-6h2.5v6h4.5a1 1 0 001-1V9.75" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </button>

              <button
                onClick={() => { localStorage.removeItem('user'); router.push('/login?role=cso'); }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>

              {activeTab === 'visitors' && (
                <div className="hidden md:block relative">
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.6-5.15a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
                  </svg>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search visitors..."
                    className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
              )}

              <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Notifications">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
              </button>
            </div>
          </div>

          <div className="lg:hidden px-4 flex gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('events')}
              className={`pb-3 pt-2 border-b-2 text-sm font-semibold whitespace-nowrap ${
                activeTab === 'events' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`pb-3 pt-2 border-b-2 text-sm font-semibold whitespace-nowrap ${
                activeTab === 'visitors' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500'
              }`}
            >
              Visitors
            </button>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8 max-w-7xl">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => activeTab === 'events' && setSelectedRequestStatus('all')}
              role={activeTab === 'events' ? 'button' : undefined}
              tabIndex={activeTab === 'events' ? 0 : -1}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                activeTab === 'events' ? 'cursor-pointer hover:shadow-md' : 'border-slate-200'
              } ${
                activeTab === 'events' && selectedRequestStatus === 'all'
                  ? 'border-primary-300 ring-2 ring-primary-200'
                  : 'border-slate-200'
              }`}
            >
              <p className="text-xs uppercase tracking-wider font-bold text-primary-600">Total {activeTab === 'events' ? 'Requests' : 'Visitors'}</p>
              <p className="text-4xl font-bold mt-2 mb-1 text-slate-800">{activeTab === 'events' ? eventRequests.length : stats.total}</p>
              <p className="text-sm text-slate-500">All time</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => activeTab === 'events' && setSelectedRequestStatus('pending')}
              role={activeTab === 'events' ? 'button' : undefined}
              tabIndex={activeTab === 'events' ? 0 : -1}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                activeTab === 'events' ? 'cursor-pointer hover:shadow-md' : ''
              } ${
                activeTab === 'events' && selectedRequestStatus === 'pending'
                  ? 'border-amber-300 ring-2 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <p className="text-xs uppercase tracking-wider font-bold text-amber-600">Pending</p>
              <p className="text-4xl font-bold mt-2 mb-1 text-slate-800">{activeTab === 'events' ? eventRequestStats.pending : stats.pending}</p>
              <p className="text-sm text-slate-500">Awaiting review</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => activeTab === 'events' && setSelectedRequestStatus('approved')}
              role={activeTab === 'events' ? 'button' : undefined}
              tabIndex={activeTab === 'events' ? 0 : -1}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                activeTab === 'events' ? 'cursor-pointer hover:shadow-md' : ''
              } ${
                activeTab === 'events' && selectedRequestStatus === 'approved'
                  ? 'border-green-300 ring-2 ring-green-200'
                  : 'border-slate-200'
              }`}
            >
              <p className="text-xs uppercase tracking-wider font-bold text-green-600">Approved</p>
              <p className="text-4xl font-bold mt-2 mb-1 text-slate-800">{activeTab === 'events' ? eventRequestStats.approved : stats.approved}</p>
              <p className="text-sm text-slate-500">{activeTab === 'events' ? 'Live events' : 'Approved visitors'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => activeTab === 'events' && setSelectedRequestStatus('rejected')}
              role={activeTab === 'events' ? 'button' : undefined}
              tabIndex={activeTab === 'events' ? 0 : -1}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                activeTab === 'events' ? 'cursor-pointer hover:shadow-md' : ''
              } ${
                activeTab === 'events' && selectedRequestStatus === 'rejected'
                  ? 'border-red-300 ring-2 ring-red-200'
                  : 'border-slate-200'
              }`}
            >
              <p className="text-xs uppercase tracking-wider font-bold text-red-600">{activeTab === 'events' ? 'Rejected' : 'Revoked'}</p>
              <p className="text-4xl font-bold mt-2 mb-1 text-slate-800">{activeTab === 'events' ? eventRequestStats.rejected : stats.revoked}</p>
              <p className="text-sm text-slate-500">Declined</p>
            </motion.div>
          </div>

          {activeTab === 'events' && (
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-slate-800">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-bold">
                      {selectedRequestStatus === 'all'
                        ? 'All Requests'
                        : selectedRequestStatus === 'pending'
                          ? 'Pending Requests'
                          : selectedRequestStatus === 'approved'
                            ? 'Approved Requests'
                            : 'Rejected Requests'}
                    </h3>
                  </div>
                </div>
                <div className="p-4 sm:p-5">

              {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                  <p className="text-slate-500 text-sm mt-3">Loading requests...</p>
                </div>
              ) : displayedRequests.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center relative">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-3 ${
                    selectedRequestStatus === 'pending' ? 'border-amber-500' :
                    selectedRequestStatus === 'approved' ? 'border-green-500' :
                    selectedRequestStatus === 'rejected' ? 'border-red-500' :
                    'border-slate-300'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      selectedRequestStatus === 'pending' ? 'text-amber-500' :
                      selectedRequestStatus === 'approved' ? 'text-green-500' :
                      selectedRequestStatus === 'rejected' ? 'text-red-500' :
                      'text-slate-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={
                        selectedRequestStatus === 'pending' ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" :
                        selectedRequestStatus === 'approved' ? "M5 13l4 4L19 7" :
                        selectedRequestStatus === 'rejected' ? "M6 18L18 6M6 6l12 12" :
                        "M8 6h8M8 12h8M8 18h8"
                      } />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">
                    {selectedRequestStatus === 'all' ? 'No event requests' : `No ${selectedRequestStatus} event requests`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedDisplayedRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-lg leading-tight">{request.event_name}</h4>
                          <p className="text-sm text-slate-500 mt-1">{request.department}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${
                          request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          request.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 space-y-3">
                        {request.event_description && <p className="text-sm text-slate-600">{request.event_description}</p>}

                        <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <p className="inline-flex items-center gap-1.5">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDateRange(request.date_from, request.date_to)}</span>
                          </p>
                          <p className="inline-flex items-center gap-1.5">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Expected: {request.expected_students || 'N/A'}</span>
                          </p>
                          <p className="inline-flex items-center gap-1.5">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>Capacity: {request.max_capacity || 'N/A'}</span>
                          </p>
                          <p className="inline-flex items-center gap-1.5">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Submitted: {new Date(request.created_at).toLocaleDateString('en-IN')}</span>
                          </p>
                        </div>

                        {(request.status === 'pending' || (request.status === 'rejected' && request.rejection_reason)) && (
                          <div className="pt-3 border-t border-slate-100">
                            {request.status === 'pending' ? (
                              <>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                  Rejection Reason
                                </label>
                                <textarea
                                  value={rejectionReason[request.id] || ''}
                                  onChange={(e) => setRejectionReason((prev) => ({ ...prev, [request.id]: e.target.value }))}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                  placeholder="Enter reason if rejecting this request"
                                  rows={2}
                                />

                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => handleApproveEvent(request.id, true)}
                                    disabled={isApprovingEvent === request.id}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-2.5 text-sm font-bold disabled:opacity-50"
                                  >
                                    {isApprovingEvent === request.id ? 'Processing...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleApproveEvent(request.id, false)}
                                    disabled={isApprovingEvent === request.id || !rejectionReason[request.id]}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2.5 text-sm font-bold disabled:opacity-50"
                                  >
                                    {isApprovingEvent === request.id ? 'Processing...' : 'Reject'}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700">
                                <span className="font-bold">Rejection Reason:</span> {request.rejection_reason}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Pagination currentPage={eventPage} totalPages={totalEventPages} onPageChange={setEventPage} className="pt-2" />
                </div>
              )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <h4 className="font-bold text-base sm:text-lg mb-4">Event History</h4>
                {historyRequests.length === 0 ? (
                  <p className="text-sm text-slate-400">No processed requests yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {paginatedHistoryRequests.map((request) => (
                      <div key={request.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{request.event_name}</p>
                            <p className="text-xs text-slate-500">{request.department}</p>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded ${request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">{formatDateRange(request.date_from, request.date_to)}</p>
                        {request.status === 'rejected' && request.rejection_reason && (
                          <p className="text-xs text-red-600 mt-2"><strong>Reason:</strong> {request.rejection_reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Pagination currentPage={historyPage} totalPages={totalHistoryPages} onPageChange={setHistoryPage} className="pt-4" />
              </div>
            </motion.section>
          )}

          {activeTab === 'visitors' && (
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
                  <h3 className="text-lg sm:text-xl font-bold">Visitor Records</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[220px]">
                      <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.6-5.15a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
                      </svg>
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email or ID..."
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      />
                    </div>

                    <select
                      value={selectedEventFilter}
                      onChange={(e) => setSelectedEventFilter(e.target.value)}
                      className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                      <option value="">All Events</option>
                      {uniqueEvents.map((eventName) => (
                        <option key={eventName} value={eventName}>{eventName}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        setIsLoading(true);
                        fetchVisitors();
                      }}
                      className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50"
                    >
                      Refresh
                    </button>

                    <button
                      onClick={exportToCSV}
                      className="px-3 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
                    >
                      CSV Export
                    </button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                  <p className="text-slate-500 text-sm mt-3">Loading visitors...</p>
                </div>
              ) : filteredVisitors.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">No visitors found.</div>
              ) : (
                <>
                  <div className="lg:hidden space-y-3">
                    {paginatedVisitors.map((visitor) => (
                      <div key={visitor.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center">
                              {getInitials(visitor.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{visitor.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">{visitor.event_name || 'No event'} · ID: {visitor.register_number || 'N/A'}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${statusBadgeMap[visitor.status] || 'bg-slate-100 text-slate-600'}`}>
                            {visitor.status}
                          </span>
                        </div>

                        <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                          {visitor.email && <p>{visitor.email}</p>}
                          {visitor.phone && <p>{visitor.phone}</p>}
                          <p>{visitor.date_of_visit ? new Date(visitor.date_of_visit).toLocaleDateString('en-IN') : formatDateRange(visitor.date_of_visit_from, visitor.date_of_visit_to)}</p>
                        </div>

                        <div className="mt-3 flex gap-2">
                          {visitor.status !== 'approved' && (
                            <button
                              onClick={() => updateStatus(visitor.id, 'approved')}
                              className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {visitor.status !== 'revoked' && (
                            <button
                              onClick={() => updateStatus(visitor.id, 'revoked')}
                              className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Pagination currentPage={visitorPage} totalPages={totalVisitorPages} onPageChange={setVisitorPage} className="pt-1" />
                  </div>

                  <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Name</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Contact</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Event</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Visit Date</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Verified</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Status</th>
                          <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedVisitors.map((visitor) => (
                          <tr key={visitor.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="size-9 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                                  {getInitials(visitor.name)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{visitor.name}</p>
                                  <p className="text-xs text-slate-500">ID: {visitor.register_number || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              <p>{visitor.email || '-'}</p>
                              <p className="text-xs">{visitor.phone || '-'}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">{visitor.event_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {visitor.date_of_visit
                                ? new Date(visitor.date_of_visit).toLocaleDateString('en-IN')
                                : formatDateRange(visitor.date_of_visit_from, visitor.date_of_visit_to)}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{visitor.verified_by || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase ${statusBadgeMap[visitor.status] || 'bg-slate-100 text-slate-600'}`}>
                                {visitor.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                {visitor.status !== 'approved' && (
                                  <button
                                    onClick={() => updateStatus(visitor.id, 'approved')}
                                    className="px-2.5 py-1.5 rounded bg-green-600 text-white text-xs font-semibold"
                                  >
                                    Approve
                                  </button>
                                )}
                                {visitor.status !== 'revoked' && (
                                  <button
                                    onClick={() => updateStatus(visitor.id, 'revoked')}
                                    className="px-2.5 py-1.5 rounded bg-red-600 text-white text-xs font-semibold"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-4 border-t border-slate-100">
                      <Pagination currentPage={visitorPage} totalPages={totalVisitorPages} onPageChange={setVisitorPage} />
                    </div>
                  </div>
                </>
              )}
            </motion.section>
          )}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-5 flex justify-between items-center z-20">
        <button onClick={() => setActiveTab('events')} className={`flex flex-col items-center gap-1 ${activeTab === 'events' ? 'text-primary-700' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-semibold">Events</span>
        </button>

        <button onClick={() => setActiveTab('visitors')} className={`flex flex-col items-center gap-1 ${activeTab === 'visitors' ? 'text-primary-700' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          <span className="text-[10px] font-semibold">Visitors</span>
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/login?role=cso');
          }}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[10px] font-semibold">Logout</span>
        </button>
      </nav>
    </div>
  );
}
