import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabaseClient';

interface QRGeneratorProps {
  visitorId: string;
  visitorName: string;
}

interface VisitorDetails {
  visitor_category: string;
  qr_color: string;
  event_name: string;
  date_of_visit_from: string;
  date_of_visit_to: string;
  email?: string;
  phone?: string;
}

export default function QRGenerator({ visitorId, visitorName }: QRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVisitorDetails();
  }, [visitorId]);

  const fetchVisitorDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('visitors')
        .select('visitor_category, qr_color, event_name, date_of_visit_from, date_of_visit_to, email, phone')
        .eq('id', visitorId)
        .single();

      if (error) {
        console.error('[QR_GENERATOR] Error fetching visitor details:', error);
        // Use default color if fetch fails
        await generateQR('#254a9a');
      } else if (data) {
        setVisitorDetails(data);
        await generateQR(data.qr_color || '#254a9a');
      }
    } catch (error) {
      console.error('[QR_GENERATOR] Unexpected error:', error);
      await generateQR('#254a9a');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQR = async (qrColor: string) => {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const qrData = `${appUrl}/verify?id=${visitorId}`;
      const url = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: qrColor, // Use visitor's category color
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('[QR_GENERATOR] Error generating QR code:', error);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) {
      console.error('[QR_DOWNLOAD] No QR code URL available');
      alert('QR code is not ready yet. Please wait a moment and try again.');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `QR-${visitorName.replace(/\s+/g, '_')}-${visitorId.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('[QR_DOWNLOAD] ✓ QR image download initiated');
    } catch (error) {
      console.error('[QR_DOWNLOAD] Error downloading QR image:', error);
      alert('Failed to download QR image. Please try again.');
    }
  };

  const downloadPDF = () => {
    if (!qrCodeUrl) {
      console.error('[PDF_DOWNLOAD] No QR code URL available');
      alert('QR code is not ready yet. Please wait a moment and try again.');
      return;
    }

    try {
      console.log('[PDF_DOWNLOAD] Starting PDF generation...');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Beautiful gradient header with university branding
    pdf.setFillColor(37, 74, 154); // Primary blue
    pdf.rect(0, 0, 210, 50, 'F');
    
    // Add subtle gradient effect (darker at top)
    pdf.setFillColor(25, 60, 130);
    pdf.rect(0, 0, 210, 15, 'F');
    
    // University name - Larger and bolder
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CHRIST UNIVERSITY', 105, 22, { align: 'center' });
    
    // Subtitle with tertiary color accent
    pdf.setFillColor(189, 163, 97); // Tertiary gold
    pdf.rect(40, 30, 130, 12, 'F');
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('VISITOR ACCESS PASS', 105, 37, { align: 'center' });

    // White content area with shadow effect
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.rect(15, 60, 180, 195, 'S');
    
    // Visitor name - Large and prominent
    pdf.setTextColor(37, 74, 154);
    pdf.setFontSize(26);
    pdf.setFont('helvetica', 'bold');
    pdf.text(visitorName.toUpperCase(), 105, 80, { align: 'center' });
    
    // Decorative line under name
    pdf.setDrawColor(189, 163, 97);
    pdf.setLineWidth(1);
    pdf.line(50, 85, 160, 85);

    // Visitor Category Badge - Larger and more prominent
    if (visitorDetails?.visitor_category) {
      const categoryText = visitorDetails.visitor_category.toUpperCase();
      const categoryColors: { [key: string]: number[] } = {
        'student': [0, 123, 255],      // Blue
        'speaker': [255, 179, 0],      // Amber
        'vip': [128, 0, 0]             // Maroon
      };
      const colorRGB = categoryColors[visitorDetails.visitor_category] || [37, 74, 154];
      
      // Category badge with shadow
      pdf.setFillColor(colorRGB[0], colorRGB[1], colorRGB[2]);
      pdf.roundedRect(65, 92, 80, 14, 3, 3, 'F');
      
      // Category text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(categoryText, 105, 101, { align: 'center' });
    }

    // Event Details Section
    if (visitorDetails?.event_name) {
      // Event label
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVENT', 105, 118, { align: 'center' });
      
      // Event name - larger
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(visitorDetails.event_name, 105, 128, { align: 'center', maxWidth: 160 });
    }

    // Event Dates - More prominent
    if (visitorDetails?.date_of_visit_from && visitorDetails?.date_of_visit_to) {
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VALID DATES', 105, 142, { align: 'center' });
      
      const fromDate = new Date(visitorDetails.date_of_visit_from).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const toDate = new Date(visitorDetails.date_of_visit_to).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      pdf.setTextColor(37, 74, 154);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${fromDate}  to  ${toDate}`, 105, 151, { align: 'center' });
    }

    // QR Code with elegant border
    if (qrCodeUrl) {
      // Colored border frame with shadow effect
      if (visitorDetails?.qr_color) {
        const hexColor = visitorDetails.qr_color.replace('#', '');
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);
        
        // Shadow (slightly offset for 3D effect)
        pdf.setFillColor(200, 200, 200);
        pdf.roundedRect(53, 163, 106, 106, 3, 3, 'F');
        
        // Colored border frame
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(51, 161, 110, 110, 5, 5, 'F');
        
        // White background for QR (inner area)
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(58, 168, 96, 96, 3, 3, 'F');
      }
      
      // QR Code - centered within white background
      // White background is 96x96 starting at (58, 168)
      // QR should be 86x86 to leave 5mm padding on all sides
      // Position: 58 + 5 = 63, 168 + 5 = 173
      pdf.addImage(qrCodeUrl, 'PNG', 63, 173, 86, 86);
    }

    // Instructions - Clear and larger
    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SCAN THIS QR CODE AT THE SECURITY GATE', 105, 282, { align: 'center' });
    
    // Visitor ID - Smaller and subtle
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Visitor ID: ${visitorId}`, 105, 290, { align: 'center' });

    // Beautiful footer with gradient
    pdf.setFillColor(189, 163, 97); // Tertiary gold
    pdf.rect(0, 277, 210, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Christ University Gated Access Management', 105, 287, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Secure • Efficient • Contactless', 105, 293, { align: 'center' });

    // Save with better filename
    const safeEventName = visitorDetails?.event_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Event';
    pdf.save(`ChristUniversity_AccessPass_${visitorName.replace(/\s+/g, '_')}_${safeEventName}.pdf`);
    console.log('[PDF_DOWNLOAD] ✓ PDF download initiated successfully');
    } catch (error) {
      console.error('[PDF_DOWNLOAD] Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card text-center max-w-lg mx-auto shadow-xl"
    >
      {/* Success Icon SVG */}
      <div className="mb-6">
        <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-primary-600 mb-3">
        Registration Successful
      </h2>
      
      <p className="text-gray-600 mb-8 px-4">
        Your access request has been recorded. Present this QR code at the security gate.
      </p>

      {/* QR Code Display with Colored Border */}
      <div className="mb-6 inline-block">
        <div 
          className="p-1 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: visitorDetails?.qr_color || '#254a9a',
            padding: '8px'
          }}
        >
          <div className="bg-white p-4 rounded-lg">
            {qrCodeUrl && !isLoading ? (
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-64 h-64 md:w-80 md:h-80" />
            ) : (
              <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
        </div>
        {visitorDetails?.qr_color && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Color-coded QR for {visitorDetails.visitor_category} category
          </p>
        )}
      </div>

      {/* Visitor Info */}
      <div className="mb-6 bg-primary-50 p-4 rounded-lg space-y-3">
        <div>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-primary-600">Name:</span> {visitorName}
          </p>
        </div>
        
        {visitorDetails?.visitor_category && (
          <div>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold text-primary-600">Category:</span>
            </p>
            <span 
              className="inline-block px-4 py-2 rounded-full text-white font-semibold text-sm shadow-md"
              style={{ backgroundColor: visitorDetails.qr_color }}
            >
              {visitorDetails.visitor_category === 'student' && '🎓 Student'}
              {visitorDetails.visitor_category === 'speaker' && '🎤 Speaker/Guest'}
              {visitorDetails.visitor_category === 'vip' && '⭐ VIP'}
            </span>
          </div>
        )}

        {visitorDetails?.event_name && (
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-primary-600">Event:</span> {visitorDetails.event_name}
            </p>
          </div>
        )}

        {visitorDetails?.date_of_visit_from && visitorDetails?.date_of_visit_to && (
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-primary-600">Valid Dates:</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(visitorDetails.date_of_visit_from).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })} 
              {' to '}
              {new Date(visitorDetails.date_of_visit_to).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-500">
            <span className="font-semibold">Visitor ID:</span> {visitorId}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={downloadPDF}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download PDF Pass</span>
        </button>
        
        <button
          onClick={downloadQR}
          className="w-full bg-tertiary-600 hover:bg-tertiary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Download QR Image</span>
        </button>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <a
            href="/retrieve-qr"
            className="flex-1 text-center text-primary-600 hover:text-primary-700 font-medium py-2 text-sm inline-flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Retrieve QR Later</span>
          </a>
          <a
            href="/"
            className="flex-1 text-center text-primary-600 hover:text-primary-700 font-medium py-2 text-sm inline-flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Return to Home</span>
          </a>
        </div>
      </div>

      {/* Important Notice */}
      <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg text-left">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Important</p>
            <p className="text-sm text-gray-600 mt-1">
              Save or print this QR code. You'll need it for entry verification at the security gate.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
