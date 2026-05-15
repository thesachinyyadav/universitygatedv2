import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import QRGenerator from '@/components/QRGenerator';

const REASON_OPTIONS = ['Alumni', 'South Indian Bank', 'Department Visit'];

export default function OnSpotRegistration() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredVisitor, setRegisteredVisitor] = useState<{ id: string; name: string } | null>(null);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    []
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedReason = reason.trim();

    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    if (!trimmedReason) {
      setError('Reason for visit is required');
      return;
    }

    if (trimmedPhone) {
      const digitsOnly = trimmedPhone.replace(/\D/g, '');
      if (digitsOnly.length !== 10 && digitsOnly.length !== 12) {
        setError('Enter a valid phone number (10 digits, or 12 with country code)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/registerOnSpotVisitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          purpose: trimmedReason,
          phone: trimmedPhone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegisteredVisitor(data.visitor);
    } catch (submitError: any) {
      setError(submitError.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredVisitor) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="container mx-auto max-w-2xl">
          <QRGenerator
            visitorId={registeredVisitor.id}
            visitorName={registeredVisitor.name}
            requirePdfDownload
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-1 pb-3 sm:pb-4 md:pb-6 px-3 sm:px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-1">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-3 sm:p-4 md:p-6"
        >
          <div className="text-center mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-700 mb-1">On-Spot Registration</h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              Register instantly and generate a one-day valid QR pass
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-xs sm:text-sm">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field text-xs sm:text-sm py-2"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="label text-xs sm:text-sm">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ''))}
                inputMode="tel"
                maxLength={15}
                className="input-field text-xs sm:text-sm py-2"
                placeholder="+91 XXXXXXXXXX (optional)"
              />
            </div>

            <div>
              <label className="label text-xs sm:text-sm">Date</label>
              <input
                type="text"
                value={todayLabel}
                readOnly
                className="input-field text-xs sm:text-sm py-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="label text-xs sm:text-sm">Reason for Visit *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="input-field text-xs sm:text-sm py-2 bg-white"
              >
                <option value="" disabled>
                  Choose reason for your visit
                </option>
                {REASON_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg text-sm text-amber-800">
            Your QR will be valid only for today. You must download and save the PDF pass before leaving.
          </div>
        </motion.div>
      </div>
    </div>
  );
}