"use client";

import { createComment } from "@/app/(member)/feed/actions";
import { useActionState, useEffect, useRef } from "react";

export default function NewCommentForm({ postId }: { postId: string }) {
  const action = createComment.bind(null, postId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-5 flex gap-2">
      <input
        name="content"
        placeholder="Escreva um comentário..."
        className="flex-1 rounded-full border border-dourado/30 bg-white/60 px-4 py-2 text-sm outline-none focus:border-dourado"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-vinho px-4 py-2 font-cinzel text-sm text-pergaminho disabled:opacity-60"
      >
        {pending ? "..." : "Enviar"}
      </button>
      {state?.error && <p className="self-center text-sm text-rose">{state.error}</p>}
    </form>
  );
}
