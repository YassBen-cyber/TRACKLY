-- Script d'ajout de la colonne main_goal à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS main_goal text;
