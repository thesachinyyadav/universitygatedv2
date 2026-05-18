import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';

interface QRScannerProps {
  onScan: (visitorId: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const videoObserverRef = useRef<MutationObserver | null>(null);
  const lastScanRef = useRef<{ id: string; timestamp: number } | null>(null);
  const SCAN_COOLDOWN = 3000; // 3 seconds cooldown between same QR codes

  // Vibration feedback function
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      // Pattern: vibrate for 200ms, pause 100ms, vibrate for 200ms
      navigator.vibrate([200, 100, 200]);
    }
  };

  const requestCameraPermission = async () => {
    try {
      // Check if running on HTTPS or localhost
      const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';
      if (!isSecureContext) {
        alert('Camera requires HTTPS! Please use the deployed Vercel URL or localhost.');
        setCameraPermission('denied');
        return;
      }

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera API not available in this browser. Please use Chrome, Firefox, or Safari.');
        setCameraPermission('denied');
        return;
      }

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      
      console.log('Camera access granted');
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setScannerActive(true); // Set this BEFORE initializing scanner
      initializeScanner();
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraPermission('denied');
      
      let errorMessage = '';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access denied!\n\nPlease click the camera icon in your browser address bar and allow camera access.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is being used by another application.\n\nPlease close other apps using the camera and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported. Trying again...';
        // Retry without constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setCameraPermission('granted');
          setScannerActive(true); // Set this BEFORE initializing scanner
          initializeScanner();
          return;
        } catch (retryError) {
          errorMessage = 'Camera initialization failed.';
        }
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Security error: Camera requires HTTPS!\n\nPlease deploy to Vercel or use localhost.';
      } else {
        errorMessage = `Camera error: ${error.message || 'Unknown error'}\n\nPlease check browser settings.`;
      }
      
      alert(errorMessage);
    }
  };

  const initializeScanner = () => {
    if (scannerInitialized) return;

    // Wait for DOM element to be available
    setTimeout(() => {
      const element = document.getElementById('qr-reader');
      if (!element) {
        console.error('QR reader element not found, retrying...');
        setScannerActive(false);
        return;
      }

      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 30, // Increased FPS for faster scanning
            qrbox: { width: 280, height: 280 }, // Larger scan box
            aspectRatio: 1.0,
            disableFlip: false, // Allow flipped QR codes
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true // Use native browser barcode detector if available (much faster!)
            },
            rememberLastUsedCamera: true, // Remember camera preference
            showTorchButtonIfSupported: true // Show flashlight button if available
          },
          false
        );

        scanner.render(
          (decodedText) => {
            // Extract visitor ID from URL or use raw text
            const match = decodedText.match(/id=([a-f0-9-]+)/i);
            const visitorId = match ? match[1] : decodedText;
            
            // Check if this is a duplicate scan within cooldown period
            const now = Date.now();
            if (lastScanRef.current && 
                lastScanRef.current.id === visitorId && 
                now - lastScanRef.current.timestamp < SCAN_COOLDOWN) {
              console.log('Duplicate scan ignored (cooldown active)');
              return; // Ignore duplicate scan
            }
            
            // Update last scan
            lastScanRef.current = { id: visitorId, timestamp: now };
            
            // Trigger vibration feedback
            triggerVibration();
            
            console.log('QR code scanned:', visitorId);
            onScan(visitorId);
            // Don't clear scanner - keep it running for continuous scanning!
            // scanner.clear();
            // setScannerActive(false);
            // setScannerInitialized(false);
          },
          (error) => {
            // Ignore scanning errors - they're thrown constantly during scanning
          }
        );

        scannerRef.current = scanner;
        setScannerInitialized(true);

        // Watch for the camera <video> element so we only show the overlay
        // once the camera is actually playing (avoids floating corners during load)
        const readerEl = document.getElementById('qr-reader');
        if (readerEl) {
          const attachReadyListener = (video: HTMLVideoElement) => {
            const markReady = () => setCameraReady(true);
            if (video.readyState >= 2 && !video.paused) {
              markReady();
            } else {
              video.addEventListener('playing', markReady, { once: true });
              video.addEventListener('loadeddata', markReady, { once: true });
            }
          };

          const existingVideo = readerEl.querySelector('video');
          if (existingVideo) {
            attachReadyListener(existingVideo as HTMLVideoElement);
          } else {
            const observer = new MutationObserver(() => {
              const video = readerEl.querySelector('video');
              if (video) {
                attachReadyListener(video as HTMLVideoElement);
                observer.disconnect();
                videoObserverRef.current = null;
              }
            });
            observer.observe(readerEl, { childList: true, subtree: true });
            videoObserverRef.current = observer;
          }
        }
      } catch (error) {
        console.error('Error initializing scanner:', error);
        setScannerActive(false);
        alert('Failed to initialize camera scanner. Please try again.');
      }
    }, 100); // Small delay to ensure DOM is ready
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    if (videoObserverRef.current) {
      videoObserverRef.current.disconnect();
      videoObserverRef.current = null;
    }
    setScannerInitialized(false);
    setScannerActive(false);
    setCameraReady(false);
  };

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      if (videoObserverRef.current) {
        videoObserverRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ backgroundColor: '#eef2ff' }}
      className="card border-primary-100 shadow-xl hover:shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-4">
          <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Scan QR Code
          </h3>
        </div>

        {!scannerActive && cameraPermission !== 'denied' && (
          <>
            <div className="text-center py-10 sm:py-12 bg-white/70 border border-primary-100 rounded-lg">
              <svg className="w-14 h-14 mx-auto text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-6 px-4 text-sm">
                {cameraPermission === 'granted'
                  ? 'Camera is off'
                  : 'Camera access is required to scan visitor QR codes'}
              </p>
              <button
                onClick={requestCameraPermission}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-flex items-center justify-center space-x-3 shadow-md hover:shadow-lg active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span>Enable Camera</span>
              </button>
            </div>
            <div className="mt-3 text-left">
              <Link
                href="/retrieve-qr"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-primary-700 hover:text-primary-800 hover:underline transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6v6H3V7zm12 0h6v6h-6V7zM3 17h6v4H3v-4zm12 0h6v4h-6v-4z" />
                </svg>
                <span>Retrieve Lost QR Code</span>
              </Link>
            </div>
          </>
        )}

        {cameraPermission === 'denied' && (
          <div className="text-center py-8 bg-red-50 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700 font-medium mb-2">Camera Access Denied</p>
            <p className="text-sm text-gray-600 px-4">
              Please enable camera permissions in your browser settings to scan QR codes.
            </p>
          </div>
        )}

        {scannerActive && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-dot shadow-[0_0_6px_rgba(34,197,94,0.6)]"></div>
                <span className="text-sm font-medium text-green-700">Camera Active - Ready to Scan</span>
              </div>
              <button
                onClick={stopScanner}
                className="border border-red-500 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-full px-2.5 py-1 transition"
              >
                Stop Camera
              </button>
            </div>
            <div className="relative">
              <div id="qr-reader" className="qr-reader-wrap w-full rounded-xl overflow-hidden"></div>
              {cameraReady && (
                <div className="scan-frame" aria-hidden="true">
                  <span className="scan-corner scan-corner-tl"></span>
                  <span className="scan-corner scan-corner-tr"></span>
                  <span className="scan-corner scan-corner-bl"></span>
                  <span className="scan-corner scan-corner-br"></span>
                  <span className="scan-line"></span>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
  );
}
