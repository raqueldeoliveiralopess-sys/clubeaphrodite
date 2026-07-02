"use client";

import { createPost } from "@/app/(member)/feed/actions";
import { useActionState, useEffect, useRef } from "react";

export default function NewPostForm() {
  const [state, formAction, pending] = useActionState(createPost, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-dourado/25 bg-pergaminho-card p-5"
    >
      <textarea
        name="content"
        rows={3}
        placeholder="Compartilhe algo com o círculo..."
        className="w-full resize-none rounded-xl border border-dourado/30 bg-white/60 p-3 font-corpo text-texto outline-none focus:border-dourado"
      />
      {state?.error && <p className="mt-2 text-sm text-rose">{state.error}</p>}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-br from-rose-gold via-dourado to-dourado px-5 py-2 font-cinzel text-xs font-semibold uppercase tracking-wider text-vinho-prof disabled:opacity-60"
        >
          {pending ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
