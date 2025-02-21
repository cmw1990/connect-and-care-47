import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://csngjtaxbnebqfismwvs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbmdqdGF4Ym5lYnFmaXNtd3ZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQ0MDMyOCwiZXhwIjoyMDU0MDE2MzI4fQ.sYAyVd3MNJ5giUMEze2me-J4u-Mpwv9iD7PsuAc15LU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});
