// ── Supabase Config ──────────────────────────────────────────
// Substitua com as credenciais do seu projeto Supabase
// app.supabase.com → Project Settings → API

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL  = "https://SEU_PROJECT_ID.supabase.co";
const SUPABASE_ANON = "sua_anon_key_aqui";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
