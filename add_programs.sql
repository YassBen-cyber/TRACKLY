-- Ajout de la fonctionnalité "Programmes d'entraînement"

-- 1. Table des Programmes (Le conteneur global)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sécurité RLS : Un coach ne gère que ses propres programmes
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their programs" ON programs FOR ALL TO authenticated USING (coach_id = auth.uid());

-- 2. Table des Jours/Séances du Programme
-- Chaque ligne correspond à un "jour" spécifique du programme (jour 1, jour 2...)
CREATE TABLE program_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL, -- Ex: 1 pour "Jour 1"
  session_template_id UUID REFERENCES session_templates(id) ON DELETE SET NULL, -- Optionnel, si on lie une séance existante
  title TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]', -- Les exercices si le coach les crée manuellement pour ce jour
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sécurité RLS : Un coach ne gère que les séances des programmes qui lui appartiennent
ALTER TABLE program_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their program sessions" ON program_sessions FOR ALL TO authenticated USING (
  program_id IN (SELECT id FROM programs WHERE coach_id = auth.uid())
);
