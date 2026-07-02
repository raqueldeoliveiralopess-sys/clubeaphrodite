"use client";

import { updateProfile } from "@/app/(member)/perfil/actions";
import { useActionState } from "react";

export type ProfileFormValues = {
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export default function EditProfileForm({ profile }: { profile: ProfileFormValues }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-1 block font-corpo text-sm text-texto-s">Nome</span>
        <input
          name="display_name"
          defaultValue={profile.display_name ?? ""}
          placeholder="Como quer ser chamada no Clube"
          className="w-full rounded-full border border-dourado/30 bg-white/60 px-4 py-2 text-texto outline-none focus:border-dourado"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-corpo text-sm text-texto-s">
          URL do avatar
        </span>
        <input
          name="avatar_url"
          defaultValue={profile.avatar_url ?? ""}
          placeholder="https://..."
          className="w-full rounded-full border border-dourado/30 bg-white/60 px-4 py-2 text-texto outline-none focus:border-dourado"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-corpo text-sm text-texto-s">Bio</span>
        <textarea
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ""}
          placeholder="Um pouco sobre você..."
          className="w-full resize-none rounded-xl border border-dourado/30 bg-white/60 p-3 text-texto outline-none focus:border-dourado"
        />
      </label>

      {state?.error && <p className="text-sm text-rose">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-vinho-2">Perfil atualizado.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gradient-to-br from-rose-gold via-dourado to-dourado px-6 py-2 font-cinzel text-xs font-semibold uppercase tracking-wider text-vinho-prof disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
