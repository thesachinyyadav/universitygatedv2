import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import QRGenerator from '@/components/QRGenerator';
import { Button, Input, Card } from '@/components/ui';

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

  const [formData, setFormData] = useState({
    department: '',
    event_name: '',
    event_description: '',
    date_from: '',
    date_to: '',
    expected_students: '',
    max_capacity: '',
  });

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

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    setGeneratedVisitors([]);

    const selectedEvent = eventRequests.find(e => e.id === bulkFormData.event_id);
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
            headers: { 'Content-Type': 'application/json' },
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
      setErrorMessage(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  if (!user) {
    return null;
  }

  const stats = {
    total: eventRequests.length,
    pending: eventRequests.filter(r => r.status === 'pending').length,
    approved: eventRequests.filter(r => r.status === 'approved').length,
    rejected: eventRequests.filter(r => r.status === 'rejected').length,
  };

  const approvedEvents = eventRequests.filter(r => r.status === 'approved');

  // QR Display Mode
  if (generatedVisitors.length > 0 && currentVisitorIndex < generatedVisitors.length) {
    const currentVisitor = generatedVisitors[currentVisitorIndex];
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-xl w-full">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Generated</h2>
            <p className="text-gray-500">
              Visitor {currentVisitorIndex + 1} of {generatedVisitors.length}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {generatedVisitors.map((_, idx) => (
                <div key={idx} className={`h-2 w-2 rounded-full ${idx === currentVisitorIndex ? 'bg-primary-600' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <QRGenerator visitorId={currentVisitor.id} visitorName={currentVisitor.name} />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setCurrentVisitorIndex(prev => prev - 1)}
              disabled={currentVisitorIndex === 0}
              variant="outline"
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentVisitorIndex < generatedVisitors.length - 1) {
                  setCurrentVisitorIndex(prev => prev + 1);
                } else {
                  setGeneratedVisitors([]);
                  setCurrentVisitorIndex(0);
                  setActiveTab('bulk-qr');
                }
              }}
              variant="primary"
              className="flex-1"
            >
              {currentVisitorIndex < generatedVisitors.length - 1 ? 'Next Visitor' : 'Finish'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectStyles = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white text-gray-800 font-medium";

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Organiser Dashboard</h1>
            <p className="text-gray-600">Welcome, <strong>{user.full_name || user.username}</strong></p>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending</p>
              <p className="text-xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2 text-center min-w-[100px]">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Approved</p>
              <p className="text-xl font-bold text-green-500">{stats.approved}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white/50 backdrop-blur-sm p-1 rounded-xl w-fit border border-gray-200/50">
          <Button
            variant={activeTab === 'events' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('events')}
            size="sm"
          >
            Event Requests
          </Button>
          <Button
            variant={activeTab === 'bulk-qr' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('bulk-qr')}
            size="sm"
          >
            Bulk QR Generator
          </Button>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {successMessage}
            </motion.div>
          )}
          {errorMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => setShowForm(!showForm)}
                variant="primary"
                leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
              >
                {showForm ? 'Cancel Request' : 'New Event Request'}
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
                  <Card className="border-primary-100 shadow-xl shadow-primary-500/5">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">New Event Request</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                          <select name="department" value={formData.department} onChange={handleInputChange} required className={selectStyles}>
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Commerce">Commerce</option>
                            <option value="Professional Studies">Professional Studies</option>
                            {/* Add more options as needed - keeping it brief for redundancy */}
                            <option value="Arts and Humanities">Arts and Humanities</option>
                            <option value="Hotel Management">Hotel Management</option>
                            <option value="Business Management">Business Management</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Law">Law</option>
                            <option value="Sciences">Sciences</option>
                            <option value="Education">Education</option>
                            <option value="Social Work">Social Work</option>
                            <option value="Sports Department">Sports Department</option>
                            <option value="CAPS">CAPS</option>
                            <option value="NCC">NCC</option>
                            <option value="Dreams">Dreams</option>
                            <option value="Alumni">Alumni Relations</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>
                        <Input
                          label="Event Name"
                          name="event_name"
                          value={formData.event_name}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Annual Tech Fest"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          name="event_description"
                          value={formData.event_description}
                          onChange={handleInputChange}
                          rows={3}
                          className={selectStyles}
                          placeholder="Briefly describe the event..."
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Start Date" type="date" name="date_from" value={formData.date_from} onChange={handleInputChange} required />
                        <Input label="End Date" type="date" name="date_to" value={formData.date_to} onChange={handleInputChange} required />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Expected Students" type="number" name="expected_students" value={formData.expected_students} onChange={handleInputChange} required />
                        <Input label="Max Capacity" type="number" name="max_capacity" value={formData.max_capacity} onChange={handleInputChange} required />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" isLoading={isSubmitting} size="lg">Submit Request</Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>
              ) : eventRequests.length === 0 ? (
                <Card className="text-center py-12 text-gray-500">No event requests found.</Card>
              ) : (
                eventRequests.map(request => (
                  <Card key={request.id} className={`border-l-4 ${request.status === 'approved' ? 'border-l-green-500' : request.status === 'rejected' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{request.event_name}</h3>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${request.status === 'approved' ? 'bg-green-600' : request.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-500'}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{request.department}</p>
                        <p className="text-gray-700 text-sm mb-3">{new Date(request.date_from).toLocaleDateString()} - {new Date(request.date_to).toLocaleDateString()}</p>

                        {request.status === 'rejected' && request.rejection_reason && (
                          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mt-3 border border-red-100">
                            <strong>Reason:</strong> {request.rejection_reason}
                          </div>
                        )}
                        {request.status === 'approved' && request.approved_at && (
                          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mt-3 border border-green-100">
                            Approved on {new Date(request.approved_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Capacity: {request.max_capacity}</p>
                        <p>Expected: {request.expected_students}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'bulk-qr' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk QR Generator</h3>
                <p className="text-gray-500">Generate multiple QR codes for guests (Speakers, VIPs) derived from Approved Events.</p>
              </div>

              {approvedEvents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                  <p className="text-gray-500">You need an approved event to generate bulk QR codes.</p>
                </div>
              ) : (
                <form onSubmit={handleBulkSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Event</label>
                    <select
                      value={bulkFormData.event_id}
                      onChange={(e) => setBulkFormData(prev => ({ ...prev, event_id: e.target.value }))}
                      className={selectStyles}
                      required
                    >
                      <option value="">Select an event</option>
                      {approvedEvents.map(e => (
                        <option key={e.id} value={e.id}>{e.event_name} ({new Date(e.date_from).toLocaleDateString()})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Visitor List</label>
                    {bulkFormData.visitors.map((visitor, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                        <div className="grid md:grid-cols-4 gap-4">
                          <Input placeholder="Full Name" value={visitor.name} onChange={e => handleBulkVisitorChange(idx, 'name', e.target.value)} required />
                          <Input placeholder="Email (Optional)" value={visitor.email} onChange={e => handleBulkVisitorChange(idx, 'email', e.target.value)} type="email" />
                          <Input placeholder="Phone (Optional)" value={visitor.phone} onChange={e => handleBulkVisitorChange(idx, 'phone', e.target.value)} type="tel" />
                          <div className="relative">
                            <select
                              value={visitor.category}
                              onChange={e => handleBulkVisitorChange(idx, 'category', e.target.value)}
                              className={selectStyles}
                            >
                              <option value="speaker">Speaker</option>
                              <option value="vip">VIP Guest</option>
                            </select>
                          </div>
                        </div>
                        {bulkFormData.visitors.length > 1 && (
                          <button type="button" onClick={() => removeVisitorRow(idx)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <Button type="button" onClick={addVisitorRow} variant="outline" size="sm" leftIcon={<span>+</span>}>Add Row</Button>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button type="submit" isLoading={isSubmitting} size="lg">
                      {isSubmitting ? `Generating (${bulkProgress.current}/${bulkProgress.total})...` : 'Generate QR Codes'}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
