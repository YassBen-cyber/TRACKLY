CREATE TABLE IF NOT EXISTS coach_specific_availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_specific_time_range CHECK (start_time < end_time)
);

ALTER TABLE coach_specific_availabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les coachs gèrent leurs dispos spécifiques" 
    ON coach_specific_availabilities FOR ALL 
    USING (auth.uid() = coach_id);

CREATE POLICY "Les clients voient les dispos spécifiques" 
    ON coach_specific_availabilities FOR SELECT 
    USING (
        coach_id IN (
            SELECT coach_id FROM profiles WHERE id = auth.uid()
        )
    );
