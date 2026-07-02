"use server";

import { getActiveSubscriptionByEmail } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = { error?: string; success?: boolean } | undefined;

export async function sendMagicLink(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "Digite um e-mail válido." };
  }

  const hasActiveSubscription = await getActiveSubscriptionByEmail(email);
  if (!hasActiveSubscription) {
    redirect("/sem-acesso");
  }

  const requestHeaders = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { error: "Não foi possível enviar o link. Tente novamente em instantes." };
  }

  return { success: true };
}
