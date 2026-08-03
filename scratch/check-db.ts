import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
  const { data, error } = await supabase.from('payments').select('*').limit(1)
  console.log('Payments query sample:', data, 'Error:', error)
  const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1)
  console.log('Profiles query sample:', pData, 'Error:', pError)
}

test()
