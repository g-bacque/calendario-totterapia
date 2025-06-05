// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssqgrgjpecymlpnfgewd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcWdyZ2pwZWN5bWxwbmZnZXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzAxNjEsImV4cCI6MjA2NDcwNjE2MX0.5K8WS6PXA2_Fw6b0mw4Eze02Gsmqg3-jp4szBEx0q7I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
