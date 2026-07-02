import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client com a service_role key — ignora RLS. Nunca importar em código
 * que roda no browser; usar apenas em Route Handlers server-side
 * (ex.: webhook da Kiwify).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
