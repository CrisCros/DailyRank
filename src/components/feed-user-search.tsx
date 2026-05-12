"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";

type SearchUser = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  socialStatus: "NONE" | "FRIENDS" | "PENDING_SENT" | "PENDING_RECEIVED";
};

const statusLabels = {
  NONE: "Ver perfil",
  FRIENDS: "Amigos",
  PENDING_SENT: "Solicitud enviada",
  PENDING_RECEIVED: "Solicitud recibida",
};

export function FeedUserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          setUsers([]);
          return;
        }
        const payload = (await response.json()) as { users?: SearchUser[] };
        setUsers(payload.users ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setUsers([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const showPanel = query.trim().length > 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <Search className="size-5 text-slate-400" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-500 dark:text-slate-200 dark:placeholder:text-slate-400"
          placeholder="Buscar perfiles por nombre o @username"
          type="search"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (nextQuery.trim().length < 2) {
              setUsers([]);
              setIsLoading(false);
            }
          }}
        />
      </div>

      {showPanel ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950">
          {query.trim().length < 2 ? (
            <p className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Busca por nombre o username.
            </p>
          ) : null}
          {query.trim().length >= 2 && isLoading ? (
            <p className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Buscando...
            </p>
          ) : null}
          {query.trim().length >= 2 && !isLoading && users.length === 0 ? (
            <p className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              No se encontraron usuarios.
            </p>
          ) : null}
          {users.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <Link
                  className="flex items-center justify-between gap-3 p-3 transition hover:bg-slate-50 dark:hover:bg-slate-900"
                  href={`/users/${user.username}`}
                  key={user.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {statusLabels[user.socialStatus]}
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
