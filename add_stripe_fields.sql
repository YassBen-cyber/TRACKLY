-- Migration script for Stripe Connect (IBAN & Payments)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_connected BOOLEAN DEFAULT false;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';
