"use server";

import { compare, hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { accountSettingsSchema } from "@/validations/settings";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function settingsRedirect(type: "error" | "success", message: string): never {
  redirect(`/settings?${type}=${encodeMessage(message)}`);
}

export async function updateAccountSettingsAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = accountSettingsSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    bio: formData.get("bio"),
    theme: formData.get("theme"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.";
    settingsRedirect("error", message);
  }

  const data = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    redirect("/login");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      id: { not: user.id },
      OR: [{ email: data.email }, { username: data.username }],
    },
    select: { email: true, username: true },
  });

  if (existingUser?.email === data.email) {
    settingsRedirect("error", "Ya existe una cuenta con ese email.");
  }

  if (existingUser?.username === data.username) {
    settingsRedirect("error", "Ese username ya está en uso.");
  }

  let passwordHash: string | undefined;

  if (data.newPassword) {
    const isCurrentPasswordValid = await compare(data.currentPassword ?? "", user.passwordHash);

    if (!isCurrentPasswordValid) {
      settingsRedirect("error", "La contraseña actual no es correcta.");
    }

    passwordHash = await hash(data.newPassword, 12);
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        bio: data.bio,
        ...(passwordHash ? { passwordHash } : {}),
        settings: {
          upsert: {
            create: { theme: data.theme },
            update: { theme: data.theme },
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      settingsRedirect("error", "Ese email o username ya está en uso.");
    }

    throw error;
  }

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/dashboard");

  settingsRedirect("success", "Configuración actualizada correctamente.");
}