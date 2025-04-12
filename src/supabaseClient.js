import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://afnucyudfotmcenndods.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbnVjeXVkZm90bWNlbm5kb2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDE5ODAsImV4cCI6MjA2MDAxNzk4MH0.5Ak1vj-ElMRwxnA-iSZ7LX6fX2u03dCTnpwddRvAXaA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);