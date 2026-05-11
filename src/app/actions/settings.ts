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

function settingsRedirect(type: "error" | "success", message: string) {
  return redirect(`/settings?${type}=${encodeMessage(message)}`);
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
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }],
    },
    select: { email: true, username: true },
  });

  if (existingUser?.email === parsed.data.email) {
    settingsRedirect("error", "Ya existe una cuenta con ese email.");
  }

  if (existingUser?.username === parsed.data.username) {
    settingsRedirect("error", "Ese username ya está en uso.");
  }

  let passwordHash: string | undefined;

  if (parsed.data.newPassword) {
    const isCurrentPasswordValid = await compare(parsed.data.currentPassword ?? "", user.passwordHash);

    if (!isCurrentPasswordValid) {
      settingsRedirect("error", "La contraseña actual no es correcta.");
    }

    passwordHash = await hash(parsed.data.newPassword, 12);
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        username: parsed.data.username,
        email: parsed.data.email,
        bio: parsed.data.bio,
        ...(passwordHash ? { passwordHash } : {}),
        settings: {
          upsert: {
            create: { theme: parsed.data.theme },
            update: { theme: parsed.data.theme },
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
