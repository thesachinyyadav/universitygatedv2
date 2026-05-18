import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

const CHANNEL_NAME = 'display-events';
const EVENT_NAME = 'scan';

export type DisplayEvent =
  | { type: 'success'; name: string }
  | { type: 'denied'; reason?: string }
  | { type: 'invalid' };

let senderChannel: RealtimeChannel | null = null;

function ensureSenderChannel(): RealtimeChannel {
  if (!senderChannel) {
    senderChannel = supabase.channel(CHANNEL_NAME);
    senderChannel.subscribe();
  }
  return senderChannel;
}

export function broadcastDisplayEvent(event: DisplayEvent) {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage(event);
      bc.close();
    } catch {}
  }

  try {
    const channel = ensureSenderChannel();
    channel.send({ type: 'broadcast', event: EVENT_NAME, payload: event });
  } catch {}
}

export function primeDisplaySender() {
  ensureSenderChannel();
}

export function subscribeToDisplayEvents(
  handler: (event: DisplayEvent) => void
): () => void {
  let bc: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (e) => handler(e.data as DisplayEvent);
  }

  const channel = supabase.channel(CHANNEL_NAME);
  channel
    .on('broadcast', { event: EVENT_NAME }, ({ payload }) => {
      handler(payload as DisplayEvent);
    })
    .subscribe();

  return () => {
    if (bc) bc.close();
    supabase.removeChannel(channel);
  };
}
