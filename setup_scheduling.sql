-- Create session_templates table
CREATE TABLE session_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration INT NOT NULL DEFAULT 60,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  recap_schema JSONB NOT NULL DEFAULT '[]', -- Array of fields e.g. [{name: "Shooting", type: "rating", max: 10}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for session_templates
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own templates" ON session_templates FOR SELECT TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "Coaches can insert their own templates" ON session_templates FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "Coaches can update their own templates" ON session_templates FOR UPDATE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "Coaches can delete their own templates" ON session_templates FOR DELETE TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "Clients can view their coach templates" ON session_templates FOR SELECT TO authenticated USING (
  coach_id IN (SELECT coach_id FROM profiles WHERE id = auth.uid())
);

-- Create availabilities table
CREATE TABLE availabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their availabilities" ON availabilities FOR ALL TO authenticated USING (coach_id = auth.uid());
CREATE POLICY "Clients can view coach availabilities" ON availabilities FOR SELECT TO authenticated USING (
  coach_id IN (SELECT coach_id FROM profiles WHERE id = auth.uid())
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES session_templates(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their appointments" ON appointments FOR SELECT TO authenticated USING (coach_id = auth.uid() OR client_id = auth.uid());
CREATE POLICY "Coaches can insert appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());
CREATE POLICY "Clients can insert appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "Users can update their appointments" ON appointments FOR UPDATE TO authenticated USING (coach_id = auth.uid() OR client_id = auth.uid());
CREATE POLICY "Coaches can delete appointments" ON appointments FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- Create training_reports table
CREATE TABLE training_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE UNIQUE,
  metrics_data JSONB NOT NULL DEFAULT '{}',
  private_notes TEXT,
  public_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE training_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage reports" ON training_reports FOR ALL TO authenticated USING (
  appointment_id IN (SELECT id FROM appointments WHERE coach_id = auth.uid())
);
CREATE POLICY "Clients view their reports" ON training_reports FOR SELECT TO authenticated USING (
  appointment_id IN (SELECT id FROM appointments WHERE client_id = auth.uid())
);
