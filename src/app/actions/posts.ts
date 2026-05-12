"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { startOfTodayUtc } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/validations/posts";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function postRedirect(path: string, type: "error" | "success", message: string): never {
  return redirect(`${path}?${type}=${encodeMessage(message)}`);
}

function getPostInput(formData: FormData) {
  return postSchema.safeParse({
    rating: formData.get("rating"),
    title: formData.get("title"),
    description: formData.get("description"),
    mood: formData.get("mood"),
    visibility: formData.get("visibility"),
    photoUrl: formData.get("photoUrl"),
  });
}

async function getRequiredUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

export async function createPostAction(formData: FormData) {
  const userId = await getRequiredUserId();
  const parsed = getPostInput(formData);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Revisa los datos de tu día.";
    postRedirect("/day/new", "error", message);
  }

  const date = startOfTodayUtc();

  try {
    const post = await prisma.post.create({
      data: {
        ...parsed.data,
        date,
        userId,
      },
      select: { id: true },
    });

    revalidatePath("/day");
    revalidatePath("/feed");
    revalidatePath("/dashboard");
    redirect(`/posts/${post.id}?success=${encodeMessage("Tu día se ha guardado correctamente.")}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existingPost = await prisma.post.findUnique({
        where: { userId_date: { userId, date } },
        select: { id: true },
      });

      if (existingPost) {
        redirect(`/posts/${existingPost.id}/edit?error=${encodeMessage("Ya tienes una publicación principal para hoy. Puedes editarla aquí.")}`);
      }
    }

    throw error;
  }
}

export async function updatePostAction(formData: FormData) {
  const userId = await getRequiredUserId();
  const postId = String(formData.get("postId") ?? "");

  if (!postId) {
    postRedirect("/day", "error", "No se encontró la publicación que quieres editar.");
  }

  const parsed = getPostInput(formData);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Revisa los datos de tu día.";
    postRedirect(`/posts/${postId}/edit`, "error", message);
  }

  const result = await prisma.post.updateMany({
    where: { id: postId, userId },
    data: parsed.data,
  });

  if (result.count === 0) {
    postRedirect("/day", "error", "No puedes editar una publicación que no es tuya.");
  }

  revalidatePath("/day");
  revalidatePath("/feed");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}?success=${encodeMessage("Publicación actualizada correctamente.")}`);
}

export async function deletePostAction(formData: FormData) {
  const userId = await getRequiredUserId();
  const postId = String(formData.get("postId") ?? "");

  if (!postId) {
    postRedirect("/day", "error", "No se encontró la publicación que quieres borrar.");
  }

  const result = await prisma.post.deleteMany({
    where: { id: postId, userId },
  });

  if (result.count === 0) {
    postRedirect("/day", "error", "No puedes borrar una publicación que no es tuya.");
  }

  revalidatePath("/day");
  revalidatePath("/feed");
  revalidatePath("/dashboard");
  redirect(`/day?success=${encodeMessage("Publicación borrada correctamente.")}`);
}
