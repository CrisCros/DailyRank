"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { friendshipPairKey } from "@/lib/friendships";
import { createNotificationAndTrim } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { friendshipIdSchema, userIdSchema } from "@/validations/friendships";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function friendsRedirect(type: "error" | "success", message: string): never {
  redirect(`/friends?${type}=${encodeMessage(message)}`);
}

async function getRequiredUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

function revalidateFriendshipViews() {
  revalidatePath("/friends");
  revalidatePath("/feed");
  revalidatePath("/profile");
  revalidatePath("/notifications");
}

export async function sendFriendRequestAction(formData: FormData) {
  const requesterId = await getRequiredUserId();
  const parsedReceiverId = userIdSchema.safeParse(String(formData.get("receiverId") ?? ""));

  if (!parsedReceiverId.success) {
    friendsRedirect("error", parsedReceiverId.error.issues[0]?.message ?? "El usuario no es válido.");
  }

  const receiverId = parsedReceiverId.data;

  if (requesterId === receiverId) {
    friendsRedirect("error", "No puedes enviarte una solicitud a ti mismo.");
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, name: true },
  });

  if (!receiver) {
    friendsRedirect("error", "No se encontró el usuario al que quieres añadir.");
  }

  const pairKey = friendshipPairKey(requesterId, receiverId);
  const existing = await prisma.friendship.findUnique({
    where: { pairKey },
    select: { id: true, status: true },
  });

  if (existing?.status === "PENDING") {
    friendsRedirect("error", "Ya existe una solicitud pendiente entre ambos usuarios.");
  }

  if (existing?.status === "ACCEPTED") {
    friendsRedirect("error", "Ya sois amigos.");
  }

  try {
    const friendship = existing?.status === "REJECTED"
      ? await prisma.friendship.update({
          where: { id: existing.id },
          data: {
            requesterId,
            receiverId,
            status: "PENDING",
          },
          select: { id: true },
        })
      : await prisma.friendship.create({
          data: {
            requesterId,
            receiverId,
            pairKey,
          },
          select: { id: true },
        });

    await createNotificationAndTrim({
      recipientId: receiverId,
      actorId: requesterId,
      type: "FRIEND_REQUEST_RECEIVED",
      friendshipId: friendship.id,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      friendsRedirect("error", "Ya existe una relación o solicitud entre ambos usuarios.");
    }

    throw error;
  }

  revalidateFriendshipViews();
  friendsRedirect("success", `Solicitud enviada a ${receiver.name}.`);
}

export async function acceptFriendRequestAction(formData: FormData) {
  const receiverId = await getRequiredUserId();
  const parsedFriendshipId = friendshipIdSchema.safeParse(String(formData.get("friendshipId") ?? ""));

  if (!parsedFriendshipId.success) {
    friendsRedirect("error", parsedFriendshipId.error.issues[0]?.message ?? "La solicitud no es válida.");
  }

  const friendship = await prisma.friendship.findFirst({
    where: {
      id: parsedFriendshipId.data,
      receiverId,
      status: "PENDING",
    },
    select: { id: true, requesterId: true },
  });

  if (!friendship) {
    friendsRedirect("error", "Solo el receptor puede aceptar una solicitud pendiente.");
  }

  const result = await prisma.friendship.updateMany({
    where: {
      id: friendship.id,
      receiverId,
      status: "PENDING",
    },
    data: { status: "ACCEPTED" },
  });

  if (result.count === 0) {
    friendsRedirect("error", "Solo el receptor puede aceptar una solicitud pendiente.");
  }

  await createNotificationAndTrim({
    recipientId: friendship.requesterId,
    actorId: receiverId,
    type: "FRIEND_REQUEST_ACCEPTED",
    friendshipId: friendship.id,
  });

  revalidateFriendshipViews();
  friendsRedirect("success", "Solicitud aceptada. Ya sois amigos.");
}

export async function rejectFriendRequestAction(formData: FormData) {
  const receiverId = await getRequiredUserId();
  const parsedFriendshipId = friendshipIdSchema.safeParse(String(formData.get("friendshipId") ?? ""));

  if (!parsedFriendshipId.success) {
    friendsRedirect("error", parsedFriendshipId.error.issues[0]?.message ?? "La solicitud no es válida.");
  }

  const result = await prisma.friendship.updateMany({
    where: {
      id: parsedFriendshipId.data,
      receiverId,
      status: "PENDING",
    },
    data: { status: "REJECTED" },
  });

  if (result.count === 0) {
    friendsRedirect("error", "Solo el receptor puede rechazar una solicitud pendiente.");
  }

  revalidateFriendshipViews();
  friendsRedirect("success", "Solicitud rechazada.");
}

export async function removeFriendAction(formData: FormData) {
  const userId = await getRequiredUserId();
  const parsedFriendshipId = friendshipIdSchema.safeParse(String(formData.get("friendshipId") ?? ""));

  if (!parsedFriendshipId.success) {
    friendsRedirect("error", parsedFriendshipId.error.issues[0]?.message ?? "La amistad no es válida.");
  }

  const result = await prisma.friendship.deleteMany({
    where: {
      id: parsedFriendshipId.data,
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
  });

  if (result.count === 0) {
    friendsRedirect("error", "Solo cualquiera de los dos amigos puede eliminar esta amistad.");
  }

  revalidateFriendshipViews();
  friendsRedirect("success", "Amistad eliminada.");
}
