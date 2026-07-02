import NewPostForm from "@/components/NewPostForm";
import PostCard, { type Post } from "@/components/PostCard";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, content, media_url, pinned, created_at, author:profiles!posts_author_id_fkey(id, display_name, avatar_url), comments(count), likes(user_id)",
    )
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<Post[]>();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <NewPostForm />
      {(posts ?? []).map((post) => (
        <PostCard key={post.id} post={post} currentUserId={user!.id} />
      ))}
      {posts?.length === 0 && (
        <p className="text-center font-verso italic text-texto-s">
          Ainda não há posts. Seja a primeira a compartilhar algo.
        </p>
      )}
    </div>
  );
}
