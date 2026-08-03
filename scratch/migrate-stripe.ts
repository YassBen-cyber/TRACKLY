import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyMigration() {
  console.log('Testing adding columns...')
  // Test updating a dummy or checking if columns already exist
  const { data: pData, error: pError } = await supabase.from('profiles').select('stripe_account_id, stripe_connected').limit(1)
  if (pError) {
    console.log('Stripe columns in profiles not present yet:', pError.message)
  } else {
    console.log('Stripe columns in profiles already exist!')
  }

  const { data: payData, error: payError } = await supabase.from('payments').select('stripe_checkout_session_id, stripe_payment_intent_id, payment_method').limit(1)
  if (payError) {
    console.log('Stripe columns in payments not present yet:', payError.message)
  } else {
    console.log('Stripe columns in payments already exist!')
  }
}

applyMigration()
