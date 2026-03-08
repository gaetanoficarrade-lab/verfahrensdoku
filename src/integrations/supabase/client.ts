import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase.gaetanoficarra.de';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.ayn7R9jwFZYZCHSFQcpggY8DpS3jIXXm1gFBgeOFdtE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
