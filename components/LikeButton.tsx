import { toggleLike } from "@/app/(member)/feed/actions";

export default function LikeButton({
  postId,
  likedByMe,
  likeCount,
}: {
  postId: string;
  likedByMe: boolean;
  likeCount: number;
}) {
  const action = toggleLike.bind(null, postId);

  return (
    <form action={action}>
      <button
        type="submit"
        className={`flex items-center gap-1 text-sm ${
          likedByMe ? "text-rose" : "text-texto-s"
        }`}
      >
        <span>{likedByMe ? "♥" : "♡"}</span>
        <span>{likeCount}</span>
      </button>
    </form>
  );
}
