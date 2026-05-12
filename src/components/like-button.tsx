"use client";

import { Heart } from "lucide-react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

type LikeButtonProps = {
  action: () => Promise<void>;
  isLikedByCurrentUser: boolean;
  likesCount: number;
};

function LikeButtonInner({ isLikedByCurrentUser, likesCount }: Omit<LikeButtonProps, "action">) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-label={isLikedByCurrentUser ? "Quitar like" : "Dar like"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60",
        isLikedByCurrentUser
          ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
      )}
      disabled={pending}
      type="submit"
    >
      <Heart className={cn("size-6", isLikedByCurrentUser ? "fill-current" : null)} />
      <span>{pending ? "…" : likesCount}</span>
    </button>
  );
}

export function LikeButton({ action, isLikedByCurrentUser, likesCount }: LikeButtonProps) {
  return (
    <form action={action}>
      <LikeButtonInner isLikedByCurrentUser={isLikedByCurrentUser} likesCount={likesCount} />
    </form>
  );
}
