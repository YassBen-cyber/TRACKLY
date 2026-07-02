-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['coach'::text, 'client'::text])),
  coach_id uuid,
  full_name text NOT NULL,
  date_of_birth date,
  address text,
  medical_history text,
  created_at timestamp with time zone DEFAULT now(),
  photo_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.metric_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid,
  CONSTRAINT metric_types_pkey PRIMARY KEY (id),
  CONSTRAINT metric_types_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.metric_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  metric_type_id uuid NOT NULL,
  date timestamp with time zone DEFAULT now(),
  value numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  photo_url text,
  CONSTRAINT metric_values_pkey PRIMARY KEY (id),
  CONSTRAINT metric_values_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT metric_values_metric_type_id_fkey FOREIGN KEY (metric_type_id) REFERENCES public.metric_types(id)
);
CREATE TABLE public.availabilities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT availabilities_pkey PRIMARY KEY (id),
  CONSTRAINT availabilities_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  client_id uuid NOT NULL,
  template_id uuid,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id),
  CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.training_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL UNIQUE,
  metrics_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  private_notes text,
  public_summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT training_reports_pkey PRIMARY KEY (id),
  CONSTRAINT training_reports_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);
CREATE TABLE public.metric_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT metric_templates_pkey PRIMARY KEY (id),
  CONSTRAINT metric_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.programs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT programs_pkey PRIMARY KEY (id),
  CONSTRAINT programs_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.program_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  program_id uuid NOT NULL,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT program_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT program_sessions_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id)
);
CREATE TABLE public.assigned_programs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  program_id uuid NOT NULL,
  assigned_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT assigned_programs_pkey PRIMARY KEY (id),
  CONSTRAINT assigned_programs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT assigned_programs_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT assigned_programs_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.session_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  session_id uuid,
  session_title text NOT NULL,
  started_at timestamp with time zone NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  duration_minutes integer,
  execution_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  client_feedback text,
  coach_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT session_history_pkey PRIMARY KEY (id),
  CONSTRAINT session_history_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT session_history_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.program_sessions(id)
);
CREATE TABLE public.session_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT session_templates_pkey PRIMARY KEY (id),
  CONSTRAINT session_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.assigned_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  template_id uuid,
  title text NOT NULL,
  scheduled_date date NOT NULL,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'planned'::text,
  completed_at timestamp with time zone,
  execution_feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assigned_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT assigned_sessions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT assigned_sessions_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id),
  CONSTRAINT assigned_sessions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.session_templates(id)
);
CREATE TABLE public.client_availabilities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_availabilities_pkey PRIMARY KEY (id),
  CONSTRAINT client_availabilities_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.coach_availabilities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coach_availabilities_pkey PRIMARY KEY (id),
  CONSTRAINT coach_availabilities_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  client_id uuid NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'cancelled'::text])),
  due_date date,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id),
  CONSTRAINT payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.coach_specific_availabilities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coach_specific_availabilities_pkey PRIMARY KEY (id),
  CONSTRAINT coach_specific_availabilities_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);