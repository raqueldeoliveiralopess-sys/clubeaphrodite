"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    sendMagicLink,
    undefined,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-vinho px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-dourado/30 bg-vinho-prof p-10 text-center shadow-2xl">
        <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-dourado">
          Clube Aphrodite
        </p>
        <h1 className="mt-4 font-cinzel text-2xl text-pergaminho">
          Entrar na comunidade
        </h1>

        {state?.success ? (
          <p className="mt-8 font-verso italic text-rose-suave">
            Enviamos um link mágico para o seu e-mail. Abra a caixa de
            entrada e clique nele para acessar.
          </p>
        ) : (
          <form action={formAction} className="mt-8 space-y-4 text-left">
            <label className="block">
              <span className="mb-2 block font-corpo text-sm text-rose-suave">
                E-mail usado na assinatura
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                className="w-full rounded-full border border-dourado/40 bg-pergaminho-card px-5 py-3 text-texto outline-none focus:border-dourado"
              />
            </label>

            {state?.error && (
              <p className="font-corpo text-sm text-rose">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-gradient-to-br from-rose-gold via-dourado to-dourado px-6 py-3 font-cinzel text-sm font-semibold uppercase tracking-wider text-vinho-prof transition disabled:opacity-60"
            >
              {pending ? "Enviando..." : "Receber link mágico"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
