import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function noBlockBetweenWhere(
  currentUserId: string,
): Prisma.UserWhereInput {
  return {
    AND: [
      { blocksCreated: { none: { blockedId: currentUserId } } },
      { blocksReceived: { none: { blockerId: currentUserId } } },
    ],
  };
}

export async function hasBlockBetween(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    return false;
  }

  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: userId },
      ],
    },
    select: { id: true },
  });

  return block !== null;
}

export function visibleAuthorNotBlockedWhere(
  currentUserId: string,
): Prisma.PostWhereInput {
  return {
    user: noBlockBetweenWhere(currentUserId),
  };
}
