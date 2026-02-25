-- Migration: Add SOCIO integration columns to event_requests table
-- Enables tracking of events pushed from the SOCIO platform

-- Add socio_event_id to link back to the originating SOCIO event or fest
ALTER TABLE public.event_requests
ADD COLUMN IF NOT EXISTS socio_event_id TEXT;

-- Add source column to distinguish SOCIO-pushed requests from manual ones
ALTER TABLE public.event_requests
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Unique index on socio_event_id (where not null) to prevent duplicate pushes
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_requests_socio_event_id
ON public.event_requests(socio_event_id)
WHERE socio_event_id IS NOT NULL;

-- Index on source for filtering
CREATE INDEX IF NOT EXISTS idx_event_requests_source
ON public.event_requests(source);

COMMENT ON COLUMN public.event_requests.socio_event_id IS 'The SOCIO event_id or fest_id that triggered this request. Used for deduplication and back-referencing.';
COMMENT ON COLUMN public.event_requests.source IS 'Origin of the request: manual (organiser-submitted) or socio (auto-pushed from SOCIO platform).';
