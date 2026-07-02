import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Consulta direta (via service_role) ao status de assinatura de um
 * e-mail. Usado fora de um contexto autenticado — ex.: antes de
 * enviar o magic link, para avisar quem ainda não é assinante.
 */
export async function getActiveSubscriptionByEmail(email: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("email", email.toLowerCase().trim())
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return data !== null;
}
