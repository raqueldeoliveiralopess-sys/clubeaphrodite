"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileFormState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const display_name = String(formData.get("display_name") || "").trim();
  const avatar_url = String(formData.get("avatar_url") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      avatar_url: avatar_url || null,
      bio: bio || null,
    })
    .eq("id", user.id);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath("/perfil");
  revalidatePath("/feed");
  return { success: true };
}
