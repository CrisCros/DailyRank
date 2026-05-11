import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import "./globals.css";

export const metadata: Metadata = {
  title: "DayRank",
  description: "Registra cómo ha ido tu día y compártelo con tus amigos.",
  applicationName: "DayRank",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const settings = session?.user?.id
    ? await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
        select: { theme: true },
      })
    : null;
  const themeClass = settings?.theme === "DARK" ? "dark" : settings?.theme === "LIGHT" ? "light" : undefined;

  return (
    <html className={themeClass} lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
