ALTER TABLE metric_values ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Mettre à jour les politiques RLS pour que les clients puissent insérer/voir
DROP POLICY IF EXISTS "Clients can view their metrics" ON metric_values;
DROP POLICY IF EXISTS "Clients can insert their metrics" ON metric_values;

CREATE POLICY "Clients can view their metrics" ON metric_values FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Clients can insert their metrics" ON metric_values FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update their metrics" ON metric_values FOR UPDATE TO authenticated USING (client_id = auth.uid());
