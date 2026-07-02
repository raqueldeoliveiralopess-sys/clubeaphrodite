export default function SemAcessoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-vinho px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-dourado/30 bg-vinho-prof p-10 text-center shadow-2xl">
        <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-dourado">
          Clube Aphrodite
        </p>
        <h1 className="mt-4 font-cinzel text-2xl text-pergaminho">
          Não encontramos uma assinatura ativa
        </h1>
        <p className="mt-6 font-verso italic text-rose-suave">
          Esse e-mail ainda não tem acesso à comunidade, ou a assinatura
          não está mais ativa. Se você já é assinante, confira se digitou
          o mesmo e-mail usado na compra.
        </p>
        <a
          href="https://pay.kiwify.com.br/2NCGcMn"
          className="mt-8 inline-block rounded-full bg-gradient-to-br from-rose-gold via-dourado to-dourado px-8 py-3 font-cinzel text-sm font-semibold uppercase tracking-wider text-vinho-prof"
        >
          Quero entrar no Clube
        </a>
        <p className="mt-6">
          <a href="/login" className="font-corpo text-sm text-rose-suave underline">
            Tentar com outro e-mail
          </a>
        </p>
      </div>
    </main>
  );
}
