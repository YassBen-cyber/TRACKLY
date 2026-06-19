-- 1. METRIC TEMPLATES
-- Permet au coach de créer des groupes de métriques (ex: "Objectif Prise de Masse")
CREATE TABLE metric_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metrics JSONB NOT NULL DEFAULT '[]', -- ex: [{name: "Poids", unit: "kg"}, {name: "Tour de bras", unit: "cm"}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE metric_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their metric templates" ON metric_templates FOR ALL TO authenticated USING (coach_id = auth.uid());

-- 2. PROGRAMS
-- Un programme global contenant plusieurs séances
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their programs" ON programs FOR ALL TO authenticated USING (coach_id = auth.uid());

-- 3. PROGRAM SESSIONS
-- Une séance type faisant partie d'un programme
CREATE TABLE program_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0, -- Pour ordonner les séances dans le programme
  exercises JSONB NOT NULL DEFAULT '[]', -- Détails des exercices (ex: [{name: "Développé couché", sets: 4, reps: 8, target: "70kg", rest: "90s", video_url: ""}])
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE program_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage program sessions" ON program_sessions FOR ALL TO authenticated USING (
  program_id IN (SELECT id FROM programs WHERE coach_id = auth.uid())
);

-- 4. ASSIGNED PROGRAMS
-- Liaison entre un programme et un client
CREATE TABLE assigned_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, paused
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE assigned_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view their assigned programs" ON assigned_programs FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Coaches manage assignments" ON assigned_programs FOR ALL TO authenticated USING (assigned_by = auth.uid());

-- 5. SESSION HISTORY (EXECUTION LOGS)
-- L'historique immuable d'une séance réalisée par le client
CREATE TABLE session_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES program_sessions(id) ON DELETE SET NULL, -- peut être null si le programme est supprimé
  session_title TEXT NOT NULL, -- On garde le titre en dur au cas où la session source est modifiée
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INT,
  execution_data JSONB NOT NULL DEFAULT '[]', -- Les performances réelles du client (poids, reps, temps, ressenti)
  client_feedback TEXT,
  coach_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view and insert their history" ON session_history FOR ALL TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Coaches can view their clients history" ON session_history FOR ALL TO authenticated USING (
  client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
);
