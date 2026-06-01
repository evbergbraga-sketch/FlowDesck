import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL  = "https://xigslxjiomfkjbvoblci.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZ3NseGppb21ma2pidm9ibGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjM2MjYsImV4cCI6MjA5NTg5OTYyNn0.9aH51PZlr4luz6ryheknCoNAaUnLyCouaEmtX7LRq8k";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
