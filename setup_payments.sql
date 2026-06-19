-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les coachs voient et gèrent les paiements de leurs clients"
    ON payments FOR ALL
    USING (auth.uid() = coach_id);

CREATE POLICY "Les clients voient leurs propres paiements"
    ON payments FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Les clients peuvent simuler le paiement (mise à jour status)"
    ON payments FOR UPDATE
    USING (auth.uid() = client_id)
    WITH CHECK (auth.uid() = client_id);
