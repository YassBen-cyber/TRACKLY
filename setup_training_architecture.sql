-- 1. CLIENT AVAILABILITIES
-- Permet au client de renseigner ses jours/heures de disponibilité
CREATE TABLE client_availabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL, -- La date exacte de disponibilité
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE client_availabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients manage their availabilities" ON client_availabilities FOR ALL TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Coaches view their clients availabilities" ON client_availabilities FOR SELECT TO authenticated USING (
  client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
);

-- 2. SESSION TEMPLATES (Gabarits de Séance d'entraînement)
-- Modèles de séances créés par le coach avec les exercices détaillés
CREATE TABLE session_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]', -- [{name: "Squat", sets: 4, reps: 10, rest: "90s", notes: ""}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their session templates" ON session_templates FOR ALL TO authenticated USING (coach_id = auth.uid());

-- 3. ASSIGNED SESSIONS (Séances assignées à un client)
-- Séance planifiée pour un client à une date précise
CREATE TABLE assigned_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES session_templates(id) ON DELETE SET NULL, -- optionnel, si créé depuis un gabarit
  title TEXT NOT NULL,
  scheduled_date DATE NOT NULL, -- Date prévue de l'entraînement
  exercises JSONB NOT NULL DEFAULT '[]', -- Copie des exercices au moment de l'assignation
  status TEXT NOT NULL DEFAULT 'planned', -- planned, completed, cancelled
  completed_at TIMESTAMPTZ,
  execution_feedback TEXT, -- Retour du client après la séance (ressenti, temps réel)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE assigned_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view and update their assigned sessions" ON assigned_sessions FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Clients can update their assigned sessions (to complete them)" ON assigned_sessions FOR UPDATE TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Coaches manage assigned sessions" ON assigned_sessions FOR ALL TO authenticated USING (coach_id = auth.uid());
