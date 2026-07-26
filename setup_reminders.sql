-- Setup 24h reminder columns
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone;

ALTER TABLE public.assigned_sessions
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone;
