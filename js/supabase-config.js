import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL  = "https://ooejtjqxobfrletpssjm.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWp0anF4b2JmcmxldHBzc2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzY4ODMsImV4cCI6MjA2NzkxMjg4M30.wTCrQfXVD6q47r-vN4iEsPkwaGV0qM-oTGnQpx525Mo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
