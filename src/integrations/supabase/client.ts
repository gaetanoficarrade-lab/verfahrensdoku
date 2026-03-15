import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase.gobd-suite.de';
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MzQxNDQyMCwiZXhwIjo0OTI5MDg4MDIwLCJyb2xlIjoiYW5vbiJ9.6Vo3MBl7aXFVyFFRlMY_FFFjpZLZaoDbdp9tIdGdhko';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
