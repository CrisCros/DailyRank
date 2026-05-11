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

const themeBootScript = `
(function () {
  function resolveTheme(preference) {
    if (preference === "dark" || preference === "light") {
      return preference;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }

  try {
    var root = document.documentElement;
    var preference = root.dataset.themePreference || "light";
    var media = window.matchMedia("(prefers-color-scheme: dark)");

    applyTheme(resolveTheme(preference));

    if (preference === "system") {
      var onChange = function () {
        applyTheme(resolveTheme("system"));
      };

      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onChange);
      } else if (typeof media.addListener === "function") {
        media.addListener(onChange);
      }
    }
  } catch (_) {}
})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const settings = session?.user?.id
    ? await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
        select: { theme: true },
      })
    : null;
  const themePreference = session?.user?.id && settings?.theme ? settings.theme.toLowerCase() : "light";
  const initialThemeClass = themePreference === "dark" ? "dark" : "light";

  return (
    <html
      className={initialThemeClass}
      data-theme-preference={themePreference}
      lang="es"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
