-- Add new fields to profiles table for client onboarding
ALTER TABLE public.profiles
ADD COLUMN date_of_birth date,
ADD COLUMN address text,
ADD COLUMN medical_history text;

-- Update scheme.sql for consistency (optional but good practice)
