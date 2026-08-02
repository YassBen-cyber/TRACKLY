-- Activer RLS pour la table profiles si ce n'est pas déjà fait
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture du profil par l'utilisateur lui-même
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (id = auth.uid());

-- Autoriser la mise à jour de son propre profil
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid());

-- Autoriser l'insertion de son propre profil (si nécessaire lors de la création de compte)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());

-- Les coachs peuvent voir les profils de leurs clients
DROP POLICY IF EXISTS "Coaches can view their clients profiles" ON profiles;
CREATE POLICY "Coaches can view their clients profiles"
ON profiles FOR SELECT 
TO authenticated 
USING (coach_id = auth.uid());

-- Les clients peuvent voir le profil de leur coach
DROP POLICY IF EXISTS "Clients can view their coach profile" ON profiles;
CREATE POLICY "Clients can view their coach profile"
ON profiles FOR SELECT 
TO authenticated 
USING (id IN (SELECT coach_id FROM profiles WHERE id = auth.uid()));
