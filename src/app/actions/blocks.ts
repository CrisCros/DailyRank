"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userIdSchema } from "@/validations/friendships";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function redirectWithMessage(
  path: string,
  type: "error" | "success",
  message: string,
): never {
  redirect(`${path}?${type}=${encodeMessage(message)}`);
}

async function getRequiredUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

function revalidateSocialPaths(username?: string) {
  revalidatePath("/feed");
  revalidatePath("/friends");
  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/notifications");
  if (username) {
    revalidatePath(`/users/${username}`);
  }
}

export async function blockUserAction(formData: FormData) {
  const blockerId = await getRequiredUserId();
  const parsedBlockedId = userIdSchema.safeParse(
    String(formData.get("userId") ?? ""),
  );
  const returnTo = String(formData.get("returnTo") ?? "/settings");

  if (!parsedBlockedId.success) {
    redirectWithMessage(returnTo, "error", "El usuario no es válido.");
  }

  const blockedId = parsedBlockedId.data;

  if (blockerId === blockedId) {
    redirectWithMessage(returnTo, "error", "No puedes bloquearte a ti mismo.");
  }

  const blocked = await prisma.user.findUnique({
    where: { id: blockedId },
    select: { id: true, username: true },
  });

  if (!blocked) {
    redirectWithMessage(returnTo, "error", "No se encontró el usuario.");
  }

  try {
    await prisma.$transaction([
      prisma.friendship.deleteMany({
        where: {
          OR: [
            { requesterId: blockerId, receiverId: blockedId },
            { requesterId: blockedId, receiverId: blockerId },
          ],
        },
      }),
      prisma.userBlock.upsert({
        where: { blockerId_blockedId: { blockerId, blockedId } },
        create: { blockerId, blockedId },
        update: {},
      }),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithMessage(returnTo, "success", "Usuario bloqueado.");
    }

    throw error;
  }

  revalidateSocialPaths(blocked.username);
  redirectWithMessage(
    returnTo,
    "success",
    "Usuario bloqueado. Se eliminó cualquier amistad o solicitud pendiente.",
  );
}

export async function unblockUserAction(formData: FormData) {
  const blockerId = await getRequiredUserId();
  const parsedBlockedId = userIdSchema.safeParse(
    String(formData.get("userId") ?? ""),
  );

  if (!parsedBlockedId.success) {
    redirectWithMessage("/settings", "error", "El usuario no es válido.");
  }

  const blocked = await prisma.user.findUnique({
    where: { id: parsedBlockedId.data },
    select: { username: true },
  });

  await prisma.userBlock.deleteMany({
    where: { blockerId, blockedId: parsedBlockedId.data },
  });

  revalidateSocialPaths(blocked?.username);
  redirectWithMessage("/settings", "success", "Usuario desbloqueado.");
}
