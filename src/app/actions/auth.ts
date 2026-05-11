"use server";

import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validations/auth";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.";
    redirect(`/register?error=${encodeMessage(message)}`);
  }

  const email = parsed.data.email.toLowerCase();
  const username = parsed.data.username.toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { email: true, username: true },
  });

  if (existingUser?.email === email) {
    redirect(`/register?error=${encodeMessage("Ya existe una cuenta con ese email.")}`);
  }

  if (existingUser?.username === username) {
    redirect(`/register?error=${encodeMessage("Ese username ya está en uso.")}`);
  }

  const passwordHash = await hash(parsed.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        username,
        email,
        passwordHash,
        settings: {
          create: { theme: "LIGHT" },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/register?error=${encodeMessage("Ese email o username ya está en uso.")}`);
    }

    throw error;
  }

  redirect(`/login?success=${encodeMessage("Cuenta creada. Ya puedes iniciar sesión.")}`);
}