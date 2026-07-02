import Link from "next/link";
import LikeButton from "./LikeButton";

export type Post = {
  id: string;
  content: string;
  media_url: string | null;
  pinned: boolean;
  created_at: string;
  author: { id: string; display_name: string | null; avatar_url: string | null } | null;
  comments: { count: number }[];
  likes: { user_id: string }[];
};

export default function PostCard({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId: string;
}) {
  const commentCount = post.comments?.[0]?.count ?? 0;
  const likedByMe = post.likes?.some((l) => l.user_id === currentUserId) ?? false;

  return (
    <article className="rounded-2xl border border-dourado/25 bg-pergaminho-card p-6 shadow-sm">
      {post.pinned && (
        <p className="mb-2 font-cinzel text-[11px] uppercase tracking-widest text-dourado">
          ✦ Fixado
        </p>
      )}
      <header className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vinho-2 font-cinzel text-sm text-pergaminho">
          {(post.author?.display_name ?? "A")[0].toUpperCase()}
        </div>
        <div>
          <p className="font-cinzel text-sm text-vinho-prof">
            {post.author?.display_name ?? "Membro"}
          </p>
          <p className="text-xs text-texto-s">
            {new Date(post.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
      </header>

      <p className="mt-4 whitespace-pre-wrap font-corpo text-texto">{post.content}</p>

      {post.media_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.media_url}
          alt=""
          className="mt-4 w-full rounded-xl border border-dourado/20"
        />
      )}

      <footer className="mt-4 flex items-center gap-6 border-t border-dourado/15 pt-3">
        <LikeButton
          postId={post.id}
          likedByMe={likedByMe}
          likeCount={post.likes?.length ?? 0}
        />
        <Link href={`/feed/${post.id}`} className="text-sm text-texto-s hover:text-vinho">
          {commentCount} {commentCount === 1 ? "comentário" : "comentários"}
        </Link>
      </footer>
    </article>
  );
}
