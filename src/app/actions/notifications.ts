"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const notificationIdSchema = z.string().min(1, "La notificación no es válida.");

async function getRequiredUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

function revalidateNotificationViews() {
  revalidatePath("/notifications");
  revalidatePath("/feed");
  revalidatePath("/profile");
  revalidatePath("/stats");
}

export async function deleteNotificationAction(formData: FormData) {
  const userId = await getRequiredUserId();
  const parsedNotificationId = notificationIdSchema.safeParse(String(formData.get("notificationId") ?? ""));

  if (!parsedNotificationId.success) {
    redirect("/notifications");
  }

  await prisma.notification.deleteMany({
    where: { id: parsedNotificationId.data, recipientId: userId },
  });

  revalidateNotificationViews();
}

export async function markNotificationsAsReadAction() {
  const userId = await getRequiredUserId();

  await prisma.notification.deleteMany({
    where: { recipientId: userId },
  });

  revalidateNotificationViews();
}
