import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import QRGenerator from '@/components/QRGenerator';
import PhotoCapture from '@/components/PhotoCapture';
import { Button, Card, Input } from '@/components/ui';

interface ApprovedEvent {
  id: string;
  event_name: string;
  department: string;
  date_from: string;
  date_to: string;
  description: string;
  available_slots: number;
  max_capacity: number;
}

export default function VisitorRegister() {
  const router = useRouter();
  const [approvedEvents, setApprovedEvents] = useState<ApprovedEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    register_number: '',
    event_id: '',
    visitor_category: 'student',
    purpose: '',
  });
  const [capturedPhoto, setCapturedPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredVisitor, setRegisteredVisitor] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  const fetchApprovedEvents = async () => {
    try {
      const response = await fetch('/api/approved-events');
      const data = await response.json();
      setApprovedEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching approved events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.event_id) {
      setError('Please select an event');
      setIsSubmitting(false);
      return;
    }

    if (!capturedPhoto) {
      setError('Please capture your photo before registering');
      setIsSubmitting(false);
      return;
    }

    const selectedEvent = approvedEvents.find(e => e.id === formData.event_id);
    if (!selectedEvent) {
      setError('Selected event is no longer available');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/registerVisitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photo_data: capturedPhoto,
          event_name: selectedEvent.event_name,
          date_of_visit_from: selectedEvent.date_from,
          date_of_visit_to: selectedEvent.date_to,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegisteredVisitor(data.visitor);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredVisitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <QRGenerator
            visitorId={registeredVisitor.id}
            visitorName={registeredVisitor.name}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-xl bg-white/80 backdrop-blur-lg border border-white/50">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-primary-700 tracking-tight mb-2">
                Visitor Registration
              </h1>
              <p className="text-slate-500 text-sm">
                Complete the form below to generate your digital entry pass
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />

                <Input
                  label="College Register No."
                  name="register_number"
                  value={formData.register_number}
                  onChange={handleChange}
                  placeholder="e.g. 21BCS001"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Select Event *</label>
                {isLoadingEvents ? (
                  <div className="h-12 bg-gray-50 rounded-lg animate-pulse border border-gray-200" />
                ) : (
                  <div className="relative">
                    <select
                      name="event_id"
                      value={formData.event_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none cursor-pointer hover:border-primary-400"
                    >
                      <option value="">Choose an event to attend...</option>
                      {approvedEvents.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.event_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {formData.event_id && (() => {
                    const selectedEvent = approvedEvents.find(e => e.id === formData.event_id);
                    return selectedEvent ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 p-4 bg-primary-50 border border-primary-100 rounded-xl"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-primary-800 text-lg">{selectedEvent.event_name}</h3>
                            <p className="text-primary-600 text-sm font-medium">{selectedEvent.department}</p>
                            <p className="text-primary-700/80 text-sm mt-2 max-w-lg">{selectedEvent.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block bg-primary-200 text-primary-800 text-xs px-2 py-1 rounded-md font-bold mb-1">
                              {selectedEvent.available_slots} slots left
                            </span>
                            <p className="text-xs text-primary-600 font-mono">
                              {new Date(selectedEvent.date_from).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : null;
                  })()}
                </AnimatePresence>
              </div>

              {/* Photo Capture Section */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Photo Verification *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                  <PhotoCapture
                    onPhotoCapture={setCapturedPhoto}
                    capturedPhoto={capturedPhoto}
                  />
                </div>
              </div>

              {/* Explicit Purpose Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Purpose of Visit</label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none placeholder-gray-400"
                  placeholder="Briefly describe why you are visiting..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  className="shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? 'Registering...' : 'Generate Pass'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/')}
                >
                  Cancel
                </Button>
              </div>

              {/* Helper Note */}
              <p className="text-center text-xs text-gray-400 mt-4">
                By registering, you agree to the updated校园 security protocols.
              </p>

            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
