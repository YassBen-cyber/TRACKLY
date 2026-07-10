ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Rendez-vous',
ADD COLUMN IF NOT EXISTS meeting_url text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS location_type text NOT NULL DEFAULT 'remote' CHECK (location_type IN ('remote', 'in_person')),
ADD COLUMN IF NOT EXISTS location_details text;
