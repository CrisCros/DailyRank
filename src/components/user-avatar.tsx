import Image from "next/image";

import { cn } from "@/lib/utils";

type AvatarUser = {
  name: string | null;
  username?: string | null;
  image?: string | null;
};

type UserAvatarProps = {
  user: AvatarUser;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
};

const imageSizes = {
  sm: 36,
  md: 44,
  lg: 64,
  xl: 96,
};

export function getUserInitials(user: AvatarUser) {
  const source = user.name?.trim() || user.username?.trim() || "D";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1
      ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
      : source.slice(0, 2);

  return initials.toUpperCase();
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const pixels = imageSizes[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-black text-white ring-1 ring-white/60 dark:ring-slate-900/60",
        sizes[size],
        className,
      )}
    >
      {user.image ? (
        <Image
          alt={user.name ? `Avatar de ${user.name}` : "Avatar de usuario"}
          className="object-cover"
          fill
          sizes={`${pixels}px`}
          src={user.image}
        />
      ) : (
        <span>{getUserInitials(user)}</span>
      )}
    </div>
  );
}
