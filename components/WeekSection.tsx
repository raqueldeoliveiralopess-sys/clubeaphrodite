import Link from "next/link";
import type { LibraryItem } from "./LibraryItemCard";

function formatWeek(weekStartDate: string) {
  return new Date(`${weekStartDate}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function WeekSection({
  weekStartDate,
  items,
}: {
  weekStartDate: string;
  items: LibraryItem[];
}) {
  return (
    <Link
      href={`/biblioteca/${weekStartDate}`}
      className="block rounded-2xl border border-dourado/25 bg-pergaminho-card p-6 shadow-sm transition hover:border-dourado"
    >
      <p className="font-cinzel text-xs uppercase tracking-widest text-dourado">
        Semana de {formatWeek(weekStartDate)}
      </p>
      <p className="mt-2 font-corpo text-texto">
        {items.length} {items.length === 1 ? "conteúdo" : "conteúdos"}:{" "}
        {items.map((i) => i.title).join(", ")}
      </p>
    </Link>
  );
}
