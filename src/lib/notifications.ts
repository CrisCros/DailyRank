import type { NotificationType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MAX_NOTIFICATIONS_PER_RECIPIENT = 20;

type CreateNotificationInput = {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  friendshipId?: string | null;
};

export async function createNotificationAndTrim(input: CreateNotificationInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const notification = await tx.notification.create({ data: input });

    const staleNotifications = await tx.notification.findMany({
      where: { recipientId: input.recipientId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: MAX_NOTIFICATIONS_PER_RECIPIENT,
      select: { id: true },
    });

    if (staleNotifications.length > 0) {
      await tx.notification.deleteMany({
        where: { id: { in: staleNotifications.map((item) => item.id) } },
      });
    }

    return notification;
  });
}
