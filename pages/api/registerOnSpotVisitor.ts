import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, purpose } = req.body;

    if (!name || !purpose) {
      return res.status(400).json({ error: 'Name and reason are required' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const eventName = `On-Spot Registration ${today}`;

    let eventId: string | null = null;

    const { data: existingEvent, error: existingEventError } = await supabase
      .from('events')
      .select('id')
      .eq('event_name', eventName)
      .eq('date_from', today)
      .eq('date_to', today)
      .limit(1)
      .maybeSingle();

    if (existingEventError) {
      console.error('[ON_SPOT_REGISTER] Error looking up on-spot event:', existingEventError);
      return res.status(500).json({ error: 'Failed to prepare on-spot registration event' });
    }

    if (existingEvent?.id) {
      eventId = existingEvent.id;
    } else {
      const { data: createdEvent, error: createEventError } = await supabase
        .from('events')
        .insert([
          {
            event_name: eventName,
            department: 'Gate Office',
            date_from: today,
            date_to: today,
            max_capacity: 1000,
            current_registrations: 0,
            description: 'Daily on-spot walk-in visitors',
          },
        ])
        .select('id')
        .single();

      if (createEventError || !createdEvent) {
        console.error('[ON_SPOT_REGISTER] Error creating on-spot event:', createEventError);
        return res.status(500).json({ error: 'Failed to create on-spot registration event' });
      }

      eventId = createdEvent.id;
    }

    const { data: visitor, error: visitorError } = await supabase
      .from('visitors')
      .insert([
        {
          name,
          purpose,
          event_id: eventId,
          event_name: 'On-Spot Campus Visit',
          date_of_visit_from: today,
          date_of_visit_to: today,
          visitor_category: 'speaker',
          status: 'approved',
        },
      ])
      .select('id, name')
      .single();

    if (visitorError || !visitor) {
      console.error('[ON_SPOT_REGISTER] Error creating visitor:', visitorError);
      return res.status(500).json({ error: 'Failed to complete on-spot registration' });
    }

    return res.status(201).json({
      success: true,
      visitor,
    });
  } catch (error) {
    console.error('[ON_SPOT_REGISTER] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}