import LibraryItemCard, { type LibraryItem } from "@/components/LibraryItemCard";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function BibliotecaWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("library_items")
    .select("*")
    .eq("week_start_date", week)
    .order("published_at", { ascending: true })
    .returns<LibraryItem[]>();

  if (!items || items.length === 0) notFound();

  const formattedWeek = new Date(`${week}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="font-cinzel text-xl text-vinho-prof">
        Semana de {formattedWeek}
      </h1>
      {items.map((item) => (
        <LibraryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
