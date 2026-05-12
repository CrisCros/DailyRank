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
  const label = isLikedByCurrentUser ? "Te gusta" : "Me gusta";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        isLikedByCurrentUser
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",
      )}
      disabled={pending}
      type="submit"
    >
      <Heart className={cn("size-4", isLikedByCurrentUser ? "fill-current" : null)} />
      <span>{pending ? "Actualizando..." : label}</span>
      <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs dark:bg-slate-900/70">{likesCount}</span>
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
