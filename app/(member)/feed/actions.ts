"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: boolean } | undefined;

export async function createPost(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const content = String(formData.get("content") || "").trim();
  if (!content) return { error: "Escreva algo antes de publicar." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login novamente." };

  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, content });
  if (error) return { error: "Não foi possível publicar. Tente novamente." };

  revalidatePath("/feed");
  return { success: true };
}

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/feed");
  revalidatePath(`/feed/${postId}`);
}

export async function createComment(
  postId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const content = String(formData.get("content") || "").trim();
  if (!content) return { error: "Escreva um comentário." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, content });
  if (error) return { error: "Não foi possível comentar." };

  revalidatePath(`/feed/${postId}`);
  return { success: true };
}
