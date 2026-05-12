import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { noBlockBetweenWhere } from "@/lib/blocks";
import { friendshipPairKey } from "@/lib/friendships";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      AND: [
        noBlockBetweenWhere(session.user.id),
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    orderBy: [{ username: "asc" }],
    take: 8,
    select: { id: true, name: true, username: true, image: true },
  });

  const pairKeys = users.map((user) =>
    friendshipPairKey(session.user.id, user.id),
  );
  const friendships =
    pairKeys.length > 0
      ? await prisma.friendship.findMany({
          where: { pairKey: { in: pairKeys } },
          select: {
            pairKey: true,
            status: true,
            requesterId: true,
            receiverId: true,
          },
        })
      : [];
  const friendshipByPairKey = new Map(
    friendships.map((friendship) => [friendship.pairKey, friendship]),
  );

  return NextResponse.json({
    users: users.map((user) => {
      const friendship = friendshipByPairKey.get(
        friendshipPairKey(session.user.id, user.id),
      );
      let socialStatus:
        | "NONE"
        | "FRIENDS"
        | "PENDING_SENT"
        | "PENDING_RECEIVED" = "NONE";

      if (friendship?.status === "ACCEPTED") {
        socialStatus = "FRIENDS";
      } else if (friendship?.status === "PENDING") {
        socialStatus =
          friendship.requesterId === session.user.id
            ? "PENDING_SENT"
            : "PENDING_RECEIVED";
      }

      return { ...user, socialStatus };
    }),
  });
}
