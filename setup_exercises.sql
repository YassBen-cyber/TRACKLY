CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coach_id uuid NOT NULL,
  name text NOT NULL,
  notes text,
  video_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Activer Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Les coachs peuvent tout faire sur leurs propres exercices
CREATE POLICY "Coaches can manage their own exercises" ON public.exercises
  FOR ALL TO authenticated USING (coach_id = auth.uid());

-- Les clients peuvent lire les exercices de leur coach
CREATE POLICY "Clients can view their coach exercises" ON public.exercises
  FOR SELECT TO authenticated USING (
    coach_id IN (SELECT coach_id FROM public.profiles WHERE id = auth.uid())
  );
