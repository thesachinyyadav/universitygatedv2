import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import type { Visitor } from '@/types/database';
import { Button, Input, Card } from '@/components/ui';

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
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch('/api/visitors');
      const data = await response.json();
      setVisitors(data.visitors || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (visitorId: string, status: 'approved' | 'revoked') => {
    try {
      const response = await fetch('/api/updateStatus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: visitorId, status }),
      });

      if (response.ok) {
        fetchVisitors();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleApproveEvent = async (requestId: string, approve: boolean) => {
    setIsApprovingEvent(requestId);
    try {
      const response = await fetch('/api/cso/approve-event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
        setRejectionReason(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }
    } catch (error) {
      console.error('Error approving/rejecting event:', error);
    } finally {
      setIsApprovingEvent(null);
    }
  };

  const markNotificationAsRead = async (relatedId: string) => {
    try {
      const notification = notifications.find(n => n.related_id === relatedId);
      if (notification) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);
      }
    } catch (error) {
      console.error('[CSO] Error marking notification as read:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Event', 'Date', 'Status', 'Created'];
    const rows = visitors.map(v => [
      v.name,
      v.email || '',
      v.phone || '',
      v.event_name || '',
      (v.date_of_visit && v.date_of_visit !== '')
        ? new Date(v.date_of_visit).toLocaleDateString()
        : (v.date_of_visit_from && v.date_of_visit_to)
          ? `${new Date(v.date_of_visit_from).toLocaleDateString()} - ${new Date(v.date_of_visit_to).toLocaleDateString()}`
          : 'N/A',
      v.status,
      new Date(v.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitors-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!user) return null;

  const stats = {
    total: visitors.length,
    pending: visitors.filter(v => v.status === 'pending').length,
    approved: visitors.filter(v => v.status === 'approved').length,
    revoked: visitors.filter(v => v.status === 'revoked').length,
  };

  const pendingRequestsCount = eventRequests.filter(r => r.status === 'pending').length;

  const eventStats = visitors.reduce((acc, v) => {
    if (v.event_name) {
      acc[v.event_name] = (acc[v.event_name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topEvents = Object.entries(eventStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.event_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEvent = !selectedEventFilter || v.event_name === selectedEventFilter;

    return matchesSearch && matchesEvent;
  });

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CSO Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, <strong>{user.username}</strong>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeTab === 'events' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('events')}
              className="relative"
            >
              Event Approvals
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white">
                  {pendingRequestsCount}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'visitors' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('visitors')}
            >
              Visitor Management
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
            <div className="p-1">
              <p className="text-blue-100 text-sm font-medium mb-1">Total Visitors</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-none shadow-lg shadow-yellow-500/20">
            <div className="p-1">
              <p className="text-yellow-100 text-sm font-medium mb-1">Pending Visitors</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg shadow-green-500/20">
            <div className="p-1">
              <p className="text-green-100 text-sm font-medium mb-1">Approved Visitors</p>
              <p className="text-3xl font-bold">{stats.approved}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none shadow-lg shadow-red-500/20">
            <div className="p-1">
              <p className="text-red-100 text-sm font-medium mb-1">Revoked Visitors</p>
              <p className="text-3xl font-bold">{stats.revoked}</p>
            </div>
          </Card>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Pending Event Requests</h3>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading requests...</p>
                </div>
              ) : eventRequests.filter(r => r.status === 'pending').length === 0 ? (
                <Card className="text-center py-12 border-dashed border-2 bg-gray-50/50">
                  <p className="text-gray-500">No pending event requests</p>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {eventRequests.filter(r => r.status === 'pending').map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-yellow-500">
                      <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{request.event_name}</h3>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">PENDING</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-4">{request.department}</p>
                          <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg text-sm">{request.event_description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <p className="font-semibold text-gray-900">Date</p>
                              <p>{new Date(request.date_from).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Expected</p>
                              <p>{request.expected_students}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Capacity</p>
                              <p>{request.max_capacity}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Submitted</p>
                              <p>{new Date(request.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[250px]">
                          <Input
                            placeholder="Reason for rejection (optional)..."
                            value={rejectionReason[request.id] || ''}
                            onChange={(e) => setRejectionReason(prev => ({ ...prev, [request.id]: e.target.value }))}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproveEvent(request.id, false)}
                              disabled={isApprovingEvent === request.id || !rejectionReason[request.id]}
                              variant="danger" // Assuming danger variant exists or fallback to custom style
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              size="sm"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleApproveEvent(request.id, true)}
                              disabled={isApprovingEvent === request.id}
                              variant="primary"
                              className="flex-1"
                              size="sm"
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* History Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Request History</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {eventRequests.filter(r => r.status !== 'pending').map((request) => (
                    <Card key={request.id} className={`opacity-80 hover:opacity-100 transition-opacity ${request.status === 'approved' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{request.event_name}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{new Date(request.date_from).toLocaleDateString()}</p>
                      {request.status === 'rejected' && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">Reason: {request.rejection_reason}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Visitor Management Tab */}
          {activeTab === 'visitors' && (
            <motion.div
              key="visitors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Search visitors..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          leftIcon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchVisitors} size="sm">Refresh</Button>
                        <Button variant="outline" onClick={exportToCSV} size="sm">Export CSV</Button>
                      </div>
                    </div>

                    {selectedEventFilter && (
                      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        <span>Filter: {selectedEventFilter}</span>
                        <button onClick={() => setSelectedEventFilter('')} className="hover:text-primary-900">×</button>
                      </div>
                    )}

                    {filteredVisitors.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No visitors found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                              <th className="px-4 py-3">Visitor</th>
                              <th className="px-4 py-3">Event</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredVisitors.map((visitor) => (
                              <tr key={visitor.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                  <p className="font-medium text-gray-900">{visitor.name}</p>
                                  <p className="text-xs text-gray-500">{visitor.email || visitor.phone}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{visitor.event_name || '-'}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${visitor.status === 'approved' ? 'bg-green-100 text-green-700' :
                                      visitor.status === 'revoked' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {visitor.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    {visitor.status !== 'approved' && (
                                      <button onClick={() => updateStatus(visitor.id, 'approved')} className="text-green-600 hover:bg-green-50 p-1 rounded">✓</button>
                                    )}
                                    {visitor.status !== 'revoked' && (
                                      <button onClick={() => updateStatus(visitor.id, 'revoked')} className="text-red-600 hover:bg-red-50 p-1 rounded">✕</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <Card>
                    <h3 className="font-bold text-gray-900 mb-4">Top Events</h3>
                    <div className="space-y-2">
                      {topEvents.length > 0 ? topEvents.map(([event, count], idx) => (
                        <button
                          key={event}
                          onClick={() => setSelectedEventFilter(event)}
                          className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{event}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-500">{count}</span>
                        </button>
                      )) : (
                        <p className="text-sm text-gray-500">No event data available.</p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
