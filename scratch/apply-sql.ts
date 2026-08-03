import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runSql() {
  const sql = `
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_connected BOOLEAN DEFAULT false;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';
  `

  // Try rpc exec_sql if available
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
  console.log('RPC result:', data, 'Error:', error)
}

runSql()
