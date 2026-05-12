"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { startOfTodayUtc } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { commentContentSchema, commentIdSchema } from "@/validations/comments";
import { postIdSchema } from "@/validations/likes";
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


function canViewPost(userId: string, post: { userId: string; visibility: "PRIVATE" | "FRIENDS" | "PUBLIC" }) {
  return post.userId === userId || post.visibility === "PUBLIC";
}

function revalidatePostViews(postId: string) {
  revalidatePath("/feed");
  revalidatePath("/day");
  revalidatePath(`/posts/${postId}`);
  revalidatePath(`/posts/${postId}/edit`);
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


export async function toggleLikeAction(postId: string) {
  const userId = await getRequiredUserId();
  const parsedPostId = postIdSchema.safeParse(postId);

  if (!parsedPostId.success) {
    throw new Error(parsedPostId.error.issues[0]?.message ?? "La publicación no es válida.");
  }

  const post = await prisma.post.findUnique({
    where: { id: parsedPostId.data },
    select: {
      id: true,
      userId: true,
      visibility: true,
    },
  });

  if (!post || !canViewPost(userId, post)) {
    throw new Error("No puedes dar like a una publicación que no puedes ver.");
  }

  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId: post.id } },
    select: { id: true },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    try {
      await prisma.like.create({
        data: {
          postId: post.id,
          userId,
        },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
        throw error;
      }
    }
  }

  revalidatePostViews(post.id);
}


export async function createCommentAction(postId: string, formData: FormData) {
  const userId = await getRequiredUserId();
  const parsedPostId = postIdSchema.safeParse(postId);

  if (!parsedPostId.success) {
    throw new Error(parsedPostId.error.issues[0]?.message ?? "La publicación no es válida.");
  }

  const parsedContent = commentContentSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsedContent.success) {
    postRedirect(`/posts/${parsedPostId.data}`, "error", parsedContent.error.issues[0]?.message ?? "Revisa el comentario.");
  }

  const post = await prisma.post.findUnique({
    where: { id: parsedPostId.data },
    select: {
      id: true,
      userId: true,
      visibility: true,
    },
  });

  if (!post || !canViewPost(userId, post)) {
    throw new Error("No puedes comentar en una publicación que no puedes ver.");
  }

  await prisma.comment.create({
    data: {
      content: parsedContent.data.content,
      postId: post.id,
      userId,
    },
    select: { id: true },
  });

  revalidatePostViews(post.id);
  redirect(`/posts/${post.id}?success=${encodeMessage("Comentario publicado correctamente.")}`);
}

export async function deleteCommentAction(commentId: string) {
  const userId = await getRequiredUserId();
  const parsedCommentId = commentIdSchema.safeParse(commentId);

  if (!parsedCommentId.success) {
    throw new Error(parsedCommentId.error.issues[0]?.message ?? "El comentario no es válido.");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: parsedCommentId.data },
    select: {
      id: true,
      userId: true,
      post: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("No se encontró el comentario que quieres borrar.");
  }

  const canDelete = comment.userId === userId || comment.post.userId === userId;

  if (!canDelete) {
    throw new Error("No puedes borrar este comentario.");
  }

  await prisma.comment.delete({
    where: { id: comment.id },
    select: { id: true },
  });

  revalidatePostViews(comment.post.id);
  redirect(`/posts/${comment.post.id}?success=${encodeMessage("Comentario borrado correctamente.")}`);
}
