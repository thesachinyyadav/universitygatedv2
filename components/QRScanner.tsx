import { useState, useEffect, useRef, useCallback } from 'react';

interface QRScannerProps {
  onScan: (visitorId: string) => void;
}

type ViewportStatus = 'idle' | 'success' | 'error';

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<any>(null);
  const cooldownRef = useRef<Map<string, number>>(new Map());
  const processScanRef = useRef<(data: string) => void>(() => {});
  const viewportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [viewportStatus, setViewportStatus] = useState<ViewportStatus>('idle');

  const flashViewport = useCallback((s: 'success' | 'error') => {
    setViewportStatus(s);
    if (viewportTimerRef.current) clearTimeout(viewportTimerRef.current);
    viewportTimerRef.current = setTimeout(() => setViewportStatus('idle'), 500);
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      } catch {}
      scannerRef.current = null;
    }
    if (videoRef.current) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      } catch {}
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return;
    setCameraError(null);
    try {
      // Request permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        stream.getTracks().forEach(t => t.stop());
      } catch (err: any) {
        const name = err?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          throw new Error('Camera permission denied. Please enable it in browser settings.');
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          throw new Error('No camera found on this device.');
        } else if (name === 'NotReadableError') {
          throw new Error('Camera is in use by another app. Please close it and try again.');
        } else {
          throw new Error('Camera access required to scan QR codes.');
        }
      }

      if (scannerRef.current) await stopScanner();

      const { default: QrScanner } = await import('qr-scanner');

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result: { data: string }) => processScanRef.current(result.data),
        {
          preferredCamera: 'environment',
          highlightScanRegion: false,
          highlightCodeOutline: false,
          maxScansPerSecond: 30,
          calculateScanRegion: (v: HTMLVideoElement) => {
            const smallest = Math.min(v.videoWidth, v.videoHeight);
            const size = Math.round(smallest * 0.65);
            return {
              x: Math.round((v.videoWidth - size) / 2),
              y: Math.round((v.videoHeight - size) / 2),
              width: size,
              height: size,
            };
          },
        }
      );

      await scannerRef.current.start();

      // Apply autofocus + exposure optimisations after stream is live
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream?.getVideoTracks()[0];
        if (track) {
          const capabilities = (track.getCapabilities?.() || {}) as any;
          const advanced: any[] = [];
          if ((capabilities.focusMode || []).includes('continuous'))
            advanced.push({ focusMode: 'continuous' });
          if ((capabilities.exposureMode || []).includes('continuous'))
            advanced.push({ exposureMode: 'continuous' });
          await track.applyConstraints({
            width: { ideal: 1280 }, height: { ideal: 720 },
            frameRate: { ideal: 30 },
            ...(advanced.length > 0 ? { advanced } : {}),
          });
        }
      } catch {}

      setIsScanning(true);
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      let safeMsg = 'Camera access required to scan QR codes.';
      if (msg.includes('permission') || msg.includes('denied')) {
        safeMsg = 'Camera permission denied. Please enable it in browser settings.';
      } else if (msg.includes('no camera') || msg.includes('not found')) {
        safeMsg = 'No camera found on this device.';
      } else if (msg.includes('in use')) {
        safeMsg = 'Camera is in use by another app. Please close it and try again.';
      } else if (msg.trim()) {
        safeMsg = err.message;
      }
      setCameraError(safeMsg);
      await stopScanner();
    }
  }, [stopScanner]);

  // Keep processScan ref fresh
  useEffect(() => {
    processScanRef.current = (data: string) => {
      const match = data.match(/id=([a-f0-9-]+)/i);
      const visitorId = match ? match[1] : data;

      const now = Date.now();
      const last = cooldownRef.current.get(visitorId);
      if (last && now - last < 2500) return;
      cooldownRef.current.set(visitorId, now);

      if ('vibrate' in navigator) navigator.vibrate([70]);
      flashViewport('success');
      onScan(visitorId);
    };
  }, [onScan, flashViewport]);

  // Stop scanner when page hidden
  useEffect(() => {
    const onHide = () => { if (isScanning) void stopScanner(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [isScanning, stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); scannerRef.current.destroy(); } catch {}
      }
      if (viewportTimerRef.current) clearTimeout(viewportTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-[20px] shadow-[0_12px_40px_rgba(1,31,123,0.08)] p-4 flex flex-col items-center">
      {/* Camera viewport */}
      <div
        className="w-full relative rounded-[16px] overflow-hidden bg-white border border-[#F1F5F9]"
        style={{ aspectRatio: '1' }}
        aria-label="Camera scanner"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(1.15) contrast(1.1) saturate(1.05)' }}
          muted
          playsInline
          autoPlay
        />

        {/* Dark gradient overlay while scanning */}
        {isScanning && (
          <div
            className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.15)] to-[rgba(0,0,0,0.55)] pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Viewport flash: success = green, error = red */}
        {viewportStatus === 'success' && (
          <div className="absolute inset-0 bg-green-500/25 pointer-events-none z-20 transition-opacity" aria-hidden="true" />
        )}
        {viewportStatus === 'error' && (
          <div className="absolute inset-0 bg-red-500/25 pointer-events-none z-20 transition-opacity" aria-hidden="true" />
        )}

        {/* Corner brackets + sweep line */}
        {isScanning && (
          <div className="scan-frame" aria-hidden="true">
            <div className="scan-corner scan-corner-tl" />
            <div className="scan-corner scan-corner-tr" />
            <div className="scan-corner scan-corner-bl" />
            <div className="scan-corner scan-corner-br" />
            <div className="scan-line" />

            {/* Stop scanning button */}
            <button
              className="absolute left-3 top-3 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center z-50 pointer-events-auto active:scale-95 transition-transform text-base"
              onClick={() => void stopScanner()}
              aria-label="Stop scanning"
            >
              ✕
            </button>
          </div>
        )}

        {/* Idle state overlay */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30">
            {/* Dot grid */}
            <div
              className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.4 }}
            />
            {/* Yellow corner brackets (idle) */}
            <div className="absolute inset-0 pointer-events-none z-10 p-4">
              <div className="absolute top-4 left-4 w-9 h-9 border-t-[3px] border-l-[3px] border-[#FFBA09] rounded-tl-[12px]" />
              <div className="absolute top-4 right-4 w-9 h-9 border-t-[3px] border-r-[3px] border-[#FFBA09] rounded-tr-[12px]" />
              <div className="absolute bottom-4 left-4 w-9 h-9 border-b-[3px] border-l-[3px] border-[#FFBA09] rounded-bl-[12px]" />
              <div className="absolute bottom-4 right-4 w-9 h-9 border-b-[3px] border-r-[3px] border-[#FFBA09] rounded-br-[12px]" />
            </div>
            {/* Center icon + label */}
            <div className="z-20 flex flex-col items-center px-6 text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-[#94A3B8] opacity-40 mb-3">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z" fill="currentColor" />
              </svg>
              <p className="text-[#64748B] text-[12px] font-medium tracking-wide">
                Position QR code within the frame
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Camera error message */}
      {cameraError && !isScanning && (
        <p className="text-[12px] font-semibold text-red-500 mt-3 text-center px-2">{cameraError}</p>
      )}

      {/* Start scanning button */}
      {!isScanning && (
        <button
          onClick={() => void startScanner()}
          className="mt-4 w-full max-w-[320px] h-[44px] bg-[#011F7B] text-white rounded-[12px] font-semibold text-[13px] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform shadow-[0_8px_20px_rgba(1,31,123,0.2)]"
        >
          <svg className="w-[18px] h-[18px] text-[#FFBA09]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          Start Scanning
        </button>
      )}
    </div>
  );
}
