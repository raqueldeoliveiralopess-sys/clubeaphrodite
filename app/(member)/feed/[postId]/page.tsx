import CommentList, { type Comment } from "@/components/CommentList";
import NewCommentForm from "@/components/NewCommentForm";
import PostCard, { type Post } from "@/components/PostCard";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, content, media_url, pinned, created_at, author:profiles!posts_author_id_fkey(id, display_name, avatar_url), comments(count), likes(user_id)",
    )
    .eq("id", postId)
    .maybeSingle()
    .returns<Post>();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, created_at, author:profiles(id, display_name)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .returns<Comment[]>();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <PostCard post={post} currentUserId={user!.id} />
      <section className="rounded-2xl border border-dourado/25 bg-pergaminho-card p-6">
        <h2 className="font-cinzel text-sm uppercase tracking-widest text-vinho-prof">
          Comentários
        </h2>
        <CommentList comments={comments ?? []} />
        <NewCommentForm postId={postId} />
      </section>
    </div>
  );
}
