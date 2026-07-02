export type LibraryItem = {
  id: string;
  week_start_date: string;
  title: string;
  description: string | null;
  media_type: "video" | "audio" | "text" | "pdf";
  media_url: string | null;
  content_text: string | null;
  published_at: string;
};

export default function LibraryItemCard({ item }: { item: LibraryItem }) {
  return (
    <article className="rounded-2xl border border-dourado/25 bg-pergaminho-card p-6 shadow-sm">
      <h3 className="font-cinzel text-lg text-vinho-prof">{item.title}</h3>
      {item.description && (
        <p className="mt-1 font-verso italic text-texto-s">{item.description}</p>
      )}

      <div className="mt-4">
        {item.media_type === "video" && item.media_url && (
          <video controls src={item.media_url} className="w-full rounded-xl" />
        )}
        {item.media_type === "audio" && item.media_url && (
          <audio controls src={item.media_url} className="w-full" />
        )}
        {item.media_type === "pdf" && item.media_url && (
          <a
            href={item.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-dourado/40 px-5 py-2 font-cinzel text-xs uppercase tracking-wider text-vinho hover:bg-dourado/10"
          >
            Abrir relatório em PDF
          </a>
        )}
        {item.media_type === "text" && item.content_text && (
          <p className="whitespace-pre-wrap font-corpo text-texto">
            {item.content_text}
          </p>
        )}
      </div>
    </article>
  );
}
