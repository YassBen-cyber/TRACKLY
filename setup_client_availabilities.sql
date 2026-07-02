-- Create or alter client_availabilities table
CREATE TABLE IF NOT EXISTS public.client_availabilities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  availability_type text NOT NULL DEFAULT 'workout' CHECK (availability_type IN ('workout', 'appointment', 'both')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_availabilities_pkey PRIMARY KEY (id),
  CONSTRAINT client_availabilities_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);

-- Try adding availability_type in case the table already exists
ALTER TABLE public.client_availabilities 
ADD COLUMN IF NOT EXISTS availability_type text NOT NULL DEFAULT 'workout' CHECK (availability_type IN ('workout', 'appointment', 'both'));

-- Add location_type and location_details to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS location_type text NOT NULL DEFAULT 'remote' CHECK (location_type IN ('remote', 'in_person')),
ADD COLUMN IF NOT EXISTS location_details text;

-- Add RLS for client_availabilities
ALTER TABLE public.client_availabilities ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Clients manage their availabilities" ON public.client_availabilities;
    DROP POLICY IF EXISTS "Coaches view client availabilities" ON public.client_availabilities;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Clients manage their availabilities" ON public.client_availabilities
FOR ALL TO authenticated USING (auth.uid() = client_id);

CREATE POLICY "Coaches view client availabilities" ON public.client_availabilities
FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
);
