import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import QRGenerator from '@/components/QRGenerator';
import Pagination from '@/components/ui/Pagination';

interface EventRequest {
  id: string;
  department: string;
  event_name: string;
  event_description: string;
  date_from: string;
  date_to: string;
  expected_students: number;
  max_capacity: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_at?: string;
  created_at: string;
}

export default function OrganiserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'bulk-qr'>('events');
  const [generatedVisitors, setGeneratedVisitors] = useState<any[]>([]);
  const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [currentRequestPage, setCurrentRequestPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  // Form state for event request
  const [formData, setFormData] = useState({
    department: '',
    event_name: '',
    event_description: '',
    date_from: '',
    date_to: '',
    expected_students: '',
    max_capacity: '',
  });

  // Bulk QR form state
  const [bulkFormData, setBulkFormData] = useState({
    event_id: '',
    visitors: [{ name: '', email: '', phone: '', category: 'speaker' as 'speaker' | 'vip' }],
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login?role=organiser');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'organiser') {
      router.push('/');
      return;
    }
    setUser(parsedUser);
    fetchEventRequests(parsedUser.id);
  }, [router]);

  const fetchEventRequests = async (organiserId: string) => {
    try {
      const response = await fetch(`/api/event-requests?organiser_id=${organiserId}`);
      const data = await response.json();
      setEventRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching event requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/event-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organiser_id: user.id,
          ...formData,
          expected_students: parseInt(formData.expected_students),
          max_capacity: parseInt(formData.max_capacity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Event request submitted successfully! CSO will review it.');
        setShowForm(false);
        setFormData({
          department: '',
          event_name: '',
          event_description: '',
          date_from: '',
          date_to: '',
          expected_students: '',
          max_capacity: '',
        });
        fetchEventRequests(user.id);
      } else {
        setErrorMessage(data.error || 'Failed to submit event request');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Error submitting event request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVisitorRow = () => {
    setBulkFormData(prev => ({
      ...prev,
      visitors: [...prev.visitors, { name: '', email: '', phone: '', category: 'speaker' }]
    }));
  };

  const removeVisitorRow = (index: number) => {
    setBulkFormData(prev => ({
      ...prev,
      visitors: prev.visitors.filter((_, i) => i !== index)
    }));
  };

  const handleBulkVisitorChange = (index: number, field: string, value: string) => {
    setBulkFormData(prev => ({
      ...prev,
      visitors: prev.visitors.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login?role=organiser');
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    setGeneratedVisitors([]);

    const selectedEvent = eventRequests.find(ev => ev.id === bulkFormData.event_id);
    if (!selectedEvent) {
      setErrorMessage('Please select a valid approved event');
      setIsSubmitting(false);
      return;
    }

    const validVisitors = bulkFormData.visitors.filter(v => v.name.trim());
    if (validVisitors.length === 0) {
      setErrorMessage('Please add at least one visitor with a name');
      setIsSubmitting(false);
      return;
    }

    try {
      const results = [];
      const errors = [];

      setBulkProgress({ current: 0, total: validVisitors.length });

      for (let i = 0; i < validVisitors.length; i++) {
        const visitor = validVisitors[i];
        setBulkProgress({ current: i + 1, total: validVisitors.length });
        try {
          const payload = {
            name: visitor.name,
            email: visitor.email || '',
            phone: visitor.phone || '',
            event_id: bulkFormData.event_id,
            event_name: selectedEvent.event_name,
            date_of_visit_from: selectedEvent.date_from,
            date_of_visit_to: selectedEvent.date_to,
            visitor_category: visitor.category,
            purpose: `${visitor.category === 'speaker' ? 'Speaker' : 'VIP Guest'} for ${selectedEvent.event_name}`,
          };
          
          const response = await fetch('/api/registerVisitor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          
          if (response.ok && data.visitor) {
            results.push(data.visitor);
          } else {
            errors.push(`${visitor.name}: ${data.error || 'Registration failed'}`);
          }
        } catch (fetchError) {
          errors.push(`${visitor.name}: Network error`);
        }
      }

      if (results.length > 0) {
        setGeneratedVisitors(results);
        setCurrentVisitorIndex(0);
        setSuccessMessage(`Successfully generated ${results.length} QR code(s)!${errors.length > 0 ? ` (${errors.length} failed)` : ''}`);
        
        setBulkFormData({
          event_id: bulkFormData.event_id,
          visitors: [{ name: '', email: '', phone: '', category: 'speaker' }]
        });
      } else {
        setErrorMessage(`Failed to register any visitors. ${errors.length > 0 ? errors.join(', ') : 'Please try again.'}`);
      }
    } catch (error) {
      setErrorMessage(`An unexpected error occurred.`);
    } finally {
      setIsSubmitting(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const stats = {
    total: eventRequests.length,
    pending: eventRequests.filter(r => r.status === 'pending').length,
    approved: eventRequests.filter(r => r.status === 'approved').length,
    rejected: eventRequests.filter(r => r.status === 'rejected').length,
  };

  const filteredRequests = eventRequests.filter(req => 
    filterStatus === 'all' ? true : req.status === filterStatus
  );

  const approvedEvents = eventRequests.filter(r => r.status === 'approved');
  const requestsPerPage = 6;
  const totalRequestPages = Math.max(1, Math.ceil(filteredRequests.length / requestsPerPage));
  const paginatedEventRequests = filteredRequests.slice(
    (currentRequestPage - 1) * requestsPerPage,
    currentRequestPage * requestsPerPage
  );

  useEffect(() => {
    if (currentRequestPage > totalRequestPages) {
      setCurrentRequestPage(totalRequestPages);
    }
  }, [currentRequestPage, totalRequestPages]);

  if (!user) {
    return null;
  }

  if (generatedVisitors.length > 0 && currentVisitorIndex < generatedVisitors.length) {
    const currentVisitor = generatedVisitors[currentVisitorIndex];
    
    return (
      <div className="min-h-screen bg-gray-50 py-3 sm:py-4 md:py-6 px-3 sm:px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-2">QR Code {currentVisitorIndex + 1} of {generatedVisitors.length}</p>
              <div className="flex gap-1.5">
                {generatedVisitors.map((_, idx) => (
                  <div key={idx} className={`h-1.5 w-6 rounded-full transition-all ${idx === currentVisitorIndex ? 'bg-primary-600' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
            <button onClick={() => setGeneratedVisitors([])} className="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">Exit</button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 flex justify-center mb-8">
            <QRGenerator visitorId={currentVisitor.id} visitorName={currentVisitor.name} />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentVisitorIndex(prev => prev - 1)}
              disabled={currentVisitorIndex === 0}
              className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold disabled:opacity-50 transition-all hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentVisitorIndex < generatedVisitors.length - 1) {
                  setCurrentVisitorIndex(prev => prev + 1);
                } else {
                  setGeneratedVisitors([]);
                  setCurrentVisitorIndex(0);
                  setActiveTab('bulk-qr');
                }
              }}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-md shadow-primary-500/20 transition-all hover:bg-primary-700"
            >
              {currentVisitorIndex < generatedVisitors.length - 1 ? 'Next QR' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4 md:py-6 px-3 sm:px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header matching Guard Dashboard */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">
                Event Organiser Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] sm:text-xs md:text-sm text-slate-600">
                Welcome, <span className="font-bold text-slate-900">{user.full_name || user.username}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/')}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Stats & Tabs Area */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`text-sm sm:text-base font-bold transition-all relative pb-2 ${activeTab === 'events' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Event Requests
                  {activeTab === 'events' && <motion.div layoutId="tab" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary-600" />}
                </button>
                <button
                  onClick={() => setActiveTab('bulk-qr')}
                  className={`text-sm sm:text-base font-bold transition-all relative pb-2 ${activeTab === 'bulk-qr' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Bulk QR Generator
                  {activeTab === 'bulk-qr' && <motion.div layoutId="tab" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary-600" />}
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {errorMessage}
              </div>
            )}

            {activeTab === 'events' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                      { key: 'all', label: 'All', count: stats.total, activeColor: 'bg-primary-50 text-primary-700 border border-primary-200', badgeColor: 'bg-primary-200 text-primary-700' },
                      { key: 'approved', label: 'Approved', count: stats.approved, activeColor: 'bg-green-50 text-green-700 border border-green-200', badgeColor: 'bg-green-200 text-green-700' },
                      { key: 'pending', label: 'Pending', count: stats.pending, activeColor: 'bg-yellow-50 text-yellow-700 border border-yellow-200', badgeColor: 'bg-yellow-200 text-yellow-700' },
                      { key: 'rejected', label: 'Rejected', count: stats.rejected, activeColor: 'bg-red-50 text-red-700 border border-red-200', badgeColor: 'bg-red-200 text-red-700' },
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => setFilterStatus(item.key as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${filterStatus === item.key ? item.activeColor : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
                      >
                        <span>{item.label}</span>
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${filterStatus === item.key ? item.badgeColor : 'bg-gray-200 text-gray-700'}`}>
                          {item.count}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    {showForm ? (
                      <>Cancel</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> New Request</>
                    )}
                  </button>
                </div>

                {showForm && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 border border-gray-200 rounded-xl p-5 sm:p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-5">Create Event Request</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Department</label>
                        <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                          <option value="">Select Department</option>
                          {["Computer Science", "Commerce", "Professional Studies", "Arts and Humanities", "Others"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Event Name</label>
                        <input type="text" name="event_name" value={formData.event_name} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="e.g. Annual Tech Symposium" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Description</label>
                        <textarea name="event_description" value={formData.event_description} onChange={handleInputChange} rows={3} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="Briefly describe the event..." />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Start Date</label>
                        <input type="date" name="date_from" value={formData.date_from} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">End Date</label>
                        <input type="date" name="date_to" value={formData.date_to} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Expected Students</label>
                        <input type="number" name="expected_students" value={formData.expected_students} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="e.g. 100" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Max Capacity</label>
                        <input type="number" name="max_capacity" value={formData.max_capacity} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="e.g. 150" />
                      </div>
                      <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                        <button type="submit" disabled={isSubmitting} className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-700 disabled:opacity-50 transition-colors">
                          {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid gap-3 sm:gap-4">
                  {isLoading ? (
                    <div className="text-center py-12 text-gray-500 text-sm font-medium">Loading requests...</div>
                  ) : paginatedEventRequests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No events found matching the criteria.
                    </div>
                  ) : paginatedEventRequests.map(req => (
                    <motion.div key={req.id} layout className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{req.event_name}</h3>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">{req.department}</p>
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Dates</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-700">{new Date(req.date_from).toLocaleDateString()} - {new Date(req.date_to).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Capacity</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-700">{req.expected_students} / {req.max_capacity}</p>
                        </div>
                      </div>
                      
                      {req.status === 'rejected' && req.rejection_reason && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg mt-3">
                          <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Rejection Reason</p>
                          <p className="text-sm text-red-800">{req.rejection_reason}</p>
                        </div>
                      )}

                      {req.status === 'approved' && (
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => { setBulkFormData(prev => ({ ...prev, event_id: req.id })); setActiveTab('bulk-qr'); }}
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors bg-primary-50 px-4 py-2 rounded-lg"
                          >
                            Generate Passes
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <Pagination currentPage={currentRequestPage} totalPages={totalRequestPages} onPageChange={setCurrentRequestPage} />
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    Bulk Pass Generator
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">Generate automated entry passes for speakers and VIPs.</p>
                </div>
                {approvedEvents.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-gray-500 font-medium text-sm">No approved events available for QR generation.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBulkSubmit} className="space-y-6">
                    <div className="max-w-md bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Select Event</label>
                      <select value={bulkFormData.event_id} onChange={e => setBulkFormData(prev => ({ ...prev, event_id: e.target.value }))} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                        <option value="">Choose an approved event...</option>
                        {approvedEvents.map(e => <option key={e.id} value={e.id}>{e.event_name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Visitor List</h4>
                        <button type="button" onClick={addVisitorRow} className="text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          Add Row
                        </button>
                      </div>
                      <div className="space-y-3">
                        {bulkFormData.visitors.map((v, i) => (
                          <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 items-center">
                            <input className="sm:col-span-3 bg-white border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Full Name *" value={v.name} onChange={e => handleBulkVisitorChange(i, 'name', e.target.value)} required />
                            <input className="sm:col-span-3 bg-white border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Email Address" type="email" value={v.email} onChange={e => handleBulkVisitorChange(i, 'email', e.target.value)} />
                            <input className="sm:col-span-3 bg-white border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Phone Number" type="tel" value={v.phone} onChange={e => handleBulkVisitorChange(i, 'phone', e.target.value)} />
                            <select className="sm:col-span-2 bg-white border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer" value={v.category} onChange={e => handleBulkVisitorChange(i, 'category', e.target.value)}>
                              <option value="speaker">Speaker</option>
                              <option value="vip">VIP Guest</option>
                            </select>
                            <button type="button" onClick={() => removeVisitorRow(i)} disabled={bulkFormData.visitors.length === 1} className="sm:col-span-1 text-gray-400 hover:text-red-600 disabled:opacity-0 transition-colors flex justify-center p-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" disabled={isSubmitting || !bulkFormData.event_id} className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Processing ({bulkProgress.current}/{bulkProgress.total})
                        </>
                      ) : (
                        `Generate ${bulkFormData.visitors.filter(v => v.name).length} Passes`
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
