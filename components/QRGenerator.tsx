import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

interface QRGeneratorProps {
  visitorId: string;
  visitorName: string;
  requirePdfDownload?: boolean;
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

export default function QRGenerator({ visitorId, visitorName, requirePdfDownload = false }: QRGeneratorProps) {
  const router = useRouter();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfDownloaded, setIsPdfDownloaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    fetchVisitorDetails();
  }, [visitorId]);

  useEffect(() => {
    if (!requirePdfDownload || isPdfDownloaded) {
      return;
    }

    const warningMessage = 'Please download and save the PDF pass before leaving this page.';

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = warningMessage;
    };

    const handleRouteChangeStart = (url: string) => {
      if (url !== router.asPath) {
        alert(warningMessage);
        router.events.emit('routeChangeError');
        throw new Error('Route change blocked until PDF is downloaded');
      }
    };

    const handlePopState = () => {
      alert(warningMessage);
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [requirePdfDownload, isPdfDownloaded, router]);

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
        width: 600,
        margin: 2,
        errorCorrectionLevel: 'H',
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

  const downloadPDF = async () => {
    if (!qrCodeUrl) {
      console.error('[PDF_DOWNLOAD] No QR code URL available');
      alert('QR code is not ready yet. Please wait a moment and try again.');
      return;
    }

    try {
      console.log('[PDF_DOWNLOAD] Starting PDF generation...');

      // Rasterize at a capped target width and output JPEG to keep file size small.
      // (PNG-with-3x-upscale was producing multi-MB embeddings for raster logos.)
      const loadLogoAsJpeg = (
        src: string,
        targetWidthPx: number,
      ): Promise<{ dataUrl: string; aspect: number } | null> =>
        new Promise((resolve) => {
          const img = new Image();
          const timer = setTimeout(() => {
            console.warn(`[PDF_DOWNLOAD] Timed out loading ${src}`);
            resolve(null);
          }, 3000);
          img.onload = () => {
            clearTimeout(timer);
            try {
              const aspect =
                img.naturalWidth > 0 && img.naturalHeight > 0
                  ? img.naturalWidth / img.naturalHeight
                  : 2;
              const canvas = document.createElement('canvas');
              canvas.width = targetWidthPx;
              canvas.height = Math.max(1, Math.round(targetWidthPx / aspect));
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(null);
                return;
              }
              // JPEG has no alpha — paint white behind the logo
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve({
                dataUrl: canvas.toDataURL('image/jpeg', 0.85),
                aspect,
              });
            } catch (err) {
              console.warn(`[PDF_DOWNLOAD] Failed to convert ${src}:`, err);
              resolve(null);
            }
          };
          img.onerror = () => {
            clearTimeout(timer);
            console.warn(`[PDF_DOWNLOAD] Failed to load ${src}`);
            resolve(null);
          };
          img.src = src;
        });

      // Target px sized for sharp 14–16 mm prints (~25 px/mm = ~635 DPI is overkill;
      // ~12 px/mm = ~300 DPI is print-grade). Logos render at ~30–40 mm wide so ~400–500 px is sharp.
      const [socioLogo, christLogo] = await Promise.all([
        loadLogoAsJpeg('/socio.svg', 400),
        loadLogoAsJpeg('/christunilogo.png', 500),
      ]);

      const pageWidth = 210;
      const pageHeight = 232;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageWidth, pageHeight],
        compress: true,
      });

      // White background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // === HEADER: SOCIO (left) + CHRIST (right) ===
      if (socioLogo) {
        const h = 14;
        const w = h * socioLogo.aspect;
        pdf.addImage(socioLogo.dataUrl, 'JPEG', 15, 15, w, h, undefined, 'FAST');
      }
      if (christLogo) {
        const h = 16;
        const w = h * christLogo.aspect;
        pdf.addImage(christLogo.dataUrl, 'JPEG', 195 - w, 14, w, h, undefined, 'FAST');
      }

      // Blue divider line below logos
      pdf.setDrawColor(37, 74, 154);
      pdf.setLineWidth(0.6);
      pdf.line(15, 36, 195, 36);

      const drawCenteredSpaced = (text: string, y: number, charSpace: number) => {
        pdf.setCharSpace(0);
        const baseWidth = pdf.getTextWidth(text);
        const fullWidth = baseWidth + (text.length - 1) * charSpace;
        pdf.setCharSpace(charSpace);
        pdf.text(text, (pageWidth - fullWidth) / 2, y);
        pdf.setCharSpace(0);
      };

      // "G A T E D" big spaced title
      pdf.setTextColor(37, 74, 154);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(32);
      drawCenteredSpaced('GATED', 52, 6);

      // "OFFICIAL ENTRY PASS" subtitle
      pdf.setTextColor(160, 160, 160);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      drawCenteredSpaced('OFFICIAL ENTRY PASS', 60, 2.5);

      // === QR with per-user colored border + role strip at bottom ===
      const qrTop = 74;
      const qrBoxSize = 100;
      const qrBoxX = (pageWidth - qrBoxSize) / 2;
      const panelInset = 5;
      const stripHeight = 12; // colored strip at bottom for SPEAKER/STUDENT/VIP label
      const panelW = qrBoxSize - 2 * panelInset;
      const panelH = qrBoxSize - panelInset - stripHeight;
      const qrSize = 78;
      const qrX = qrBoxX + panelInset + (panelW - qrSize) / 2;
      const qrY = qrTop + panelInset + (panelH - qrSize) / 2;

      if (visitorDetails?.qr_color) {
        const hex = visitorDetails.qr_color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Soft shadow
        pdf.setFillColor(225, 225, 230);
        pdf.roundedRect(qrBoxX + 1, qrTop + 1, qrBoxSize, qrBoxSize, 4, 4, 'F');

        // Colored frame
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(qrBoxX, qrTop, qrBoxSize, qrBoxSize, 4, 4, 'F');

        // White inner panel (asymmetric: leaves room at the bottom for the role strip)
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(qrBoxX + panelInset, qrTop + panelInset, panelW, panelH, 2, 2, 'F');
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(qrBoxX, qrTop, qrBoxSize, qrBoxSize, 4, 4, 'F');
      }

      pdf.addImage(qrCodeUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      // === Role label on the colored bottom strip (white text) ===
      if (visitorDetails?.visitor_category) {
        const stripCenterY = qrTop + panelInset + panelH + stripHeight / 2;
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.text(
          visitorDetails.visitor_category.toUpperCase(),
          105,
          stripCenterY + 1.7,
          { align: 'center' },
        );
      }

      let cursorY = qrTop + qrBoxSize + 12;

      // === Event title (bold blue) ===
      if (visitorDetails?.event_name) {
        pdf.setTextColor(37, 74, 154);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(visitorDetails.event_name, 105, cursorY, { align: 'center', maxWidth: 170 });
        cursorY += 11;
      }

      // === Visitor name ===
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      drawCenteredSpaced(visitorName.toUpperCase(), cursorY, 1);
      cursorY += 11;

      // === Valid dates ===
      if (visitorDetails?.date_of_visit_from && visitorDetails?.date_of_visit_to) {
        const fmt = (d: string) =>
          new Date(d).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        const fromDate = fmt(visitorDetails.date_of_visit_from);
        const toDate = fmt(visitorDetails.date_of_visit_to);
        const dateLine = fromDate === toDate ? fromDate : `${fromDate}  to  ${toDate}`;

        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        drawCenteredSpaced('VALID', cursorY, 1.5);
        cursorY += 8;

        pdf.setTextColor(37, 74, 154);
        pdf.setFontSize(15);
        pdf.setFont('helvetica', 'bold');
        pdf.text(dateLine, 105, cursorY, { align: 'center' });
      }

      // === Dashed divider ===
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.4);
      pdf.setLineDashPattern([1.5, 1.5], 0);
      pdf.line(20, pageHeight - 10, pageWidth - 20, pageHeight - 10);
      pdf.setLineDashPattern([], 0);

      // === Footer line ===
      pdf.setTextColor(140, 140, 140);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        'Scan this QR code to get your attendance marked at the event.',
        105,
        pageHeight - 4,
        { align: 'center' },
      );

      // Save PDF
      const safeEventName = visitorDetails?.event_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Event';
      pdf.save(`GATED_AccessPass_${visitorName.replace(/\s+/g, '_')}_${safeEventName}.pdf`);
      setIsPdfDownloaded(true);
      console.log('[PDF_DOWNLOAD] PDF download initiated successfully');
    } catch (error) {
      console.error('[PDF_DOWNLOAD] Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const navLocked = requirePdfDownload && !isPdfDownloaded;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card text-center max-w-md mx-auto shadow-xl"
    >
      {/* Success heading */}
      <div className="flex flex-col items-center mb-5">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-primary-700">Registration Successful</h2>
        <p className="text-sm text-gray-500 mt-1">Your access pass is ready</p>
      </div>

      {/* QR preview */}
      <div className="mb-5 flex justify-center">
        <div
          className="p-2 rounded-xl shadow-md"
          style={{ backgroundColor: visitorDetails?.qr_color || '#254a9a' }}
        >
          <div className="bg-white p-3 rounded-lg">
            {qrCodeUrl && !isLoading ? (
              <img src={qrCodeUrl} alt="Access pass QR code" className="w-56 h-56 md:w-64 md:h-64" />
            ) : (
              <div className="w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visitor name */}
      <p className="text-base font-medium text-gray-800 tracking-wide mb-6">{visitorName}</p>

      {/* Primary CTA */}
      <button
        onClick={downloadPDF}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Download PDF Pass</span>
      </button>

      {navLocked && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
          Download the PDF pass to continue. Navigation is locked until the PDF is saved.
        </p>
      )}

      <a
        href="/"
        className={`block mt-4 text-sm font-medium ${
          navLocked
            ? 'text-slate-400 pointer-events-none cursor-not-allowed'
            : 'text-primary-600 hover:text-primary-700'
        }`}
      >
        Return to Home
      </a>
    </motion.div>
  );
}
