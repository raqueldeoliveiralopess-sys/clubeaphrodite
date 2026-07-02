export type Comment = {
  id: string;
  content: string;
  created_at: string;
  author: { id: string; display_name: string | null } | null;
};

export default function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="mt-4 font-verso italic text-texto-s">
        Seja a primeira a comentar.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-4">
      {comments.map((c) => (
        <li key={c.id} className="border-t border-dourado/10 pt-3">
          <p className="font-cinzel text-xs text-vinho-prof">
            {c.author?.display_name ?? "Membro"}
          </p>
          <p className="mt-1 font-corpo text-sm text-texto">{c.content}</p>
        </li>
      ))}
    </ul>
  );
}
