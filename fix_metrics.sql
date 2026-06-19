-- 1. Ajouter la colonne client_id (liée à l'athlète)
ALTER TABLE metric_types ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. Supprimer la colonne coach_id et ses dépendances (dont les anciennes politiques RLS) en cascade
ALTER TABLE metric_types DROP CONSTRAINT IF EXISTS metric_types_coach_id_fkey;
ALTER TABLE metric_types DROP COLUMN IF EXISTS coach_id CASCADE;

-- 3. Mettre à jour les règles de sécurité (RLS)
-- (Les anciennes politiques ayant été supprimées par le CASCADE, on recrée les nouvelles)

-- Le coach peut gérer les types de métriques si l'athlète (client_id) lui appartient
CREATE POLICY "Coaches manage client metric types" ON metric_types FOR ALL TO authenticated USING (
  client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
);

-- Le client peut lire ses propres types de métriques
CREATE POLICY "Clients view their own metric types" ON metric_types FOR SELECT TO authenticated USING (
  client_id = auth.uid()
);
