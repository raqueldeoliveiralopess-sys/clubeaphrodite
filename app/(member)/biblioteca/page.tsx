import WeekSection from "@/components/WeekSection";
import type { LibraryItem } from "@/components/LibraryItemCard";
import { createClient } from "@/lib/supabase/server";

export default async function BibliotecaPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("library_items")
    .select("*")
    .order("week_start_date", { ascending: false })
    .order("published_at", { ascending: false })
    .returns<LibraryItem[]>();

  const byWeek = new Map<string, LibraryItem[]>();
  for (const item of items ?? []) {
    const list = byWeek.get(item.week_start_date) ?? [];
    list.push(item);
    byWeek.set(item.week_start_date, list);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-cinzel text-xl text-vinho-prof">Biblioteca semanal</h1>
      {[...byWeek.entries()].map(([week, weekItems]) => (
        <WeekSection key={week} weekStartDate={week} items={weekItems} />
      ))}
      {byWeek.size === 0 && (
        <p className="font-verso italic text-texto-s">
          Ainda não há conteúdos publicados.
        </p>
      )}
    </div>
  );
}
