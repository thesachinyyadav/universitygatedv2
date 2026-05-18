import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { broadcastDisplayEvent, subscribeToDisplayEvents, type DisplayEvent } from '@/lib/displayEvents';

const REVERT_AFTER_MS = 5000;
const BUFFER_RESET_MS = 500;

export default function Display() {
  const [event, setEvent] = useState<DisplayEvent | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyEvent = (incoming: DisplayEvent) => {
    setEvent(incoming);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setEvent(null), REVERT_AFTER_MS);
  };

  useEffect(() => {
    const unsubscribe = subscribeToDisplayEvents(applyEvent);

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    let buffer = '';
    let bufferTimer: ReturnType<typeof setTimeout> | null = null;

    const verifyVisitorId = async (visitorId: string) => {
      let guardUsername = '';
      try {
        const userData = localStorage.getItem('user');
        if (userData) guardUsername = JSON.parse(userData).username || '';
      } catch {}

      let evt: DisplayEvent;
      try {
        const url = `/api/verifyVisitor?id=${encodeURIComponent(visitorId)}${
          guardUsername ? `&guard_username=${encodeURIComponent(guardUsername)}` : ''
        }`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.verified && data.visitor?.name) {
          evt = { type: 'success', name: data.visitor.name };
        } else if (!data.visitor) {
          evt = { type: 'invalid' };
        } else {
          evt = { type: 'denied', reason: data.dateError };
        }
      } catch {
        evt = { type: 'invalid' };
      }

      applyEvent(evt);
      broadcastDisplayEvent(evt);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (bufferTimer) clearTimeout(bufferTimer);
      bufferTimer = setTimeout(() => {
        buffer = '';
      }, BUFFER_RESET_MS);

      if (e.key === 'Enter') {
        const raw = buffer.trim();
        buffer = '';
        if (bufferTimer) {
          clearTimeout(bufferTimer);
          bufferTimer = null;
        }
        if (raw) {
          const match = raw.match(/id=([a-f0-9-]+)/i);
          const id = match ? match[1] : raw;
          verifyVisitorId(id);
        }
        return;
      }

      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      if (bufferTimer) clearTimeout(bufferTimer);
    };
  }, []);

  const isDenied = event?.type === 'denied';
  const isSuccess = event?.type === 'success';
  const isInvalid = event?.type === 'invalid';

  return (
    <>
      <Head>
        <title>Visitors Welcome Desk</title>
      </Head>
      <div
        className={`fixed inset-0 overflow-hidden text-white select-none transition-colors duration-500 ${
          isDenied ? 'bg-[#3a0d12]' : isInvalid ? 'bg-[#3d2a0a]' : isSuccess ? 'bg-[#0d3a1c]' : 'bg-[#0a1a3f]'
        }`}
      >
        <div className="absolute top-8 left-10 tracking-[0.25em] text-[#c9d6ff] text-lg md:text-xl font-light">
          VISITORS WELCOME DESK
        </div>

        <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
          {isSuccess && event ? (
            <>
              <p className="text-3xl md:text-5xl tracking-[0.4em] text-[#cfe0ff] font-light">
                WELCOME
              </p>
              <h1
                key={`success-${event.name}-${Date.now()}`}
                className="mt-6 text-5xl md:text-7xl font-semibold tracking-wide text-white drop-shadow-[0_0_25px_rgba(120,170,255,0.45)] animate-[fadeInUp_0.5s_ease-out]"
              >
                {event.name}
              </h1>
            </>
          ) : isDenied ? (
            <>
              <h1 className="text-5xl md:text-7xl font-semibold tracking-[0.25em] text-[#ff6b7a] drop-shadow-[0_0_25px_rgba(255,80,100,0.45)]">
                ACCESS DENIED
              </h1>
              <p className="mt-6 text-xl md:text-3xl tracking-[0.3em] text-[#ffc3ca] font-light">
                {event?.type === 'denied' && event.reason ? event.reason : 'Please contact security'}
              </p>
            </>
          ) : isInvalid ? (
            <>
              <h1 className="text-5xl md:text-7xl font-semibold tracking-[0.25em] text-[#ffc870] drop-shadow-[0_0_25px_rgba(255,180,80,0.45)]">
                INVALID QR CODE
              </h1>
              <p className="mt-6 text-xl md:text-3xl tracking-[0.3em] text-[#ffe1b3] font-light">
                Please try again
              </p>
            </>
          ) : (
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-[0.25em] text-white drop-shadow-[0_0_25px_rgba(120,170,255,0.35)]">
                WELCOME
              </h1>
              <p className="mt-8 md:mt-10 text-2xl md:text-4xl tracking-[0.3em] text-[#cfe0ff]/85 font-light">
                SCAN TO CONTINUE
              </p>
            </div>
          )}
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 text-white/80">
          <span className="text-[13px] font-medium">Powered by</span>
          <Image
            src="/socio.svg"
            alt="SOCIO"
            width={64}
            height={18}
            className="h-4 w-auto translate-y-[3px]"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
