"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getRequiredUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

export async function markNotificationsAsReadAction() {
  const userId = await getRequiredUserId();

  await prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  revalidatePath("/feed");
  revalidatePath("/profile");
}
