-- 1. Créer le bucket "photos" s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Supprimer les anciennes politiques au cas où
DROP POLICY IF EXISTS "Photos sont publiques" ON storage.objects;
DROP POLICY IF EXISTS "Les clients peuvent uploader des photos" ON storage.objects;
DROP POLICY IF EXISTS "Les clients peuvent supprimer leurs photos" ON storage.objects;

-- 3. Les images sont publiques (tout le monde peut les voir avec l'URL)
CREATE POLICY "Photos sont publiques"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- 4. Les utilisateurs connectés peuvent uploader des images
CREATE POLICY "Les clients peuvent uploader des photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- 5. Les utilisateurs connectés peuvent supprimer/modifier
CREATE POLICY "Les clients peuvent supprimer leurs photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos');
