import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function friendshipPairKey(userId: string, otherUserId: string) {
  return [userId, otherUserId].sort().join(":");
}

export function acceptedFriendshipWhere(
  userId: string,
  otherUserId: string,
): Prisma.FriendshipWhereInput {
  return {
    status: "ACCEPTED",
    OR: [
      { requesterId: userId, receiverId: otherUserId },
      { requesterId: otherUserId, receiverId: userId },
    ],
  };
}

export function friendsOnlyAuthorWhere(
  viewerId: string,
): Prisma.UserWhereInput {
  return {
    OR: [
      {
        sentFriendships: { some: { receiverId: viewerId, status: "ACCEPTED" } },
      },
      {
        receivedFriendships: {
          some: { requesterId: viewerId, status: "ACCEPTED" },
        },
      },
    ],
  };
}

export function visiblePostWhere(viewerId: string): Prisma.PostWhereInput {
  return {
    AND: [
      {
        user: {
          blocksCreated: { none: { blockedId: viewerId } },
          blocksReceived: { none: { blockerId: viewerId } },
        },
      },
      {
        OR: [
          { userId: viewerId },
          { visibility: "PUBLIC" },
          { visibility: "FRIENDS", user: friendsOnlyAuthorWhere(viewerId) },
        ],
      },
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

export async function areAcceptedFriends(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    return true;
  }

  const friendship = await prisma.friendship.findFirst({
    where: acceptedFriendshipWhere(userId, otherUserId),
    select: { id: true },
  });

  return friendship !== null;
}

export async function canViewPost(
  userId: string,
  post: { userId: string; visibility: "PRIVATE" | "FRIENDS" | "PUBLIC" },
) {
  if (post.userId !== userId && await hasBlockBetween(userId, post.userId)) {
    return false;
  }

  if (post.userId === userId || post.visibility === "PUBLIC") {
    return true;
  }

  if (post.visibility !== "FRIENDS") {
    return false;
  }

  return areAcceptedFriends(userId, post.userId);
}
