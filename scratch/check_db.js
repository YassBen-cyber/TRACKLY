const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zrxxehkkjpdlxwfknoeb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeHhlaGtranBkbHh3Zmtub2ViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY0MDcyNywiZXhwIjoyMDk3MjE2NzI3fQ.lA4BL4p39UhMR2lVPnHMdZM-zeojEbep_FtA7iv5tLA'
);

async function check() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching appointments:', error);
  } else {
    console.log('Successfully fetched. Example data:', data);
    
    // Also try inserting a dummy to see if it fails due to RLS or missing columns
    console.log("Checking columns by looking at data length:", data.length);
  }
}

check();
