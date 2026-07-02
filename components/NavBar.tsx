import { signOut } from "@/app/(member)/actions";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between border-b border-dourado/25 bg-vinho-prof px-6 py-4">
      <Link
        href="/feed"
        className="font-cinzel text-sm uppercase tracking-[0.25em] text-dourado-claro"
      >
        Clube Aphrodite
      </Link>
      <div className="flex items-center gap-6 font-corpo text-sm text-pergaminho">
        <Link href="/feed" className="hover:text-dourado-claro">
          Mural
        </Link>
        <Link href="/biblioteca" className="hover:text-dourado-claro">
          Biblioteca
        </Link>
        <Link href="/perfil" className="hover:text-dourado-claro">
          Perfil
        </Link>
        <form action={signOut}>
          <button type="submit" className="text-rose-suave hover:text-dourado-claro">
            Sair
          </button>
        </form>
      </div>
    </nav>
  );
}
