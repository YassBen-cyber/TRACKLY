-- Création de la table des disponibilités du coach (semaine type)
CREATE TABLE IF NOT EXISTS coach_availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Dimanche, 1 = Lundi, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Création de la table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    meeting_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_appointment_time CHECK (start_time < end_time)
);

-- Activer RLS
ALTER TABLE coach_availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies pour coach_availabilities
CREATE POLICY "Les coachs gèrent leurs disponibilités" 
    ON coach_availabilities FOR ALL 
    USING (auth.uid() = coach_id);

CREATE POLICY "Les clients voient les disponibilités de leur coach" 
    ON coach_availabilities FOR SELECT 
    USING (
        coach_id IN (
            SELECT coach_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policies pour appointments
CREATE POLICY "Les coachs gèrent leurs rendez-vous" 
    ON appointments FOR ALL 
    USING (auth.uid() = coach_id);

CREATE POLICY "Les clients gèrent leurs propres rendez-vous" 
    ON appointments FOR ALL 
    USING (auth.uid() = client_id);
