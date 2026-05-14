import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { unblockUserAction } from "@/app/actions/blocks";
import { updateAccountSettingsAction } from "@/app/actions/settings";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { AvatarSettingsForm } from "@/components/avatar-settings-form";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { UserAvatar } from "@/components/user-avatar";
import { prisma } from "@/lib/prisma";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const [session, params] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, notificationsCount, blockedUsers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        username: true,
        email: true,
        bio: true,
        image: true,
        settings: {
          select: { theme: true },
        },
      },
    }),
    prisma.notification.count({ where: { recipientId: session.user.id } }),
    prisma.userBlock.findMany({
      where: { blockerId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        blocked: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const theme = user.settings?.theme ?? "LIGHT";

  return (
    <AppShell unreadNotificationsCount={notificationsCount}>
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            Configuración
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Edita tu cuenta
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            Actualiza tus datos públicos, credenciales privadas y preferencia de
            tema. Todos los cambios se validan en el servidor antes de
            guardarse.
          </p>
        </div>

        <AvatarSettingsForm
          user={{
            name: user.name,
            username: user.username,
            image: user.image,
          }}
        />

        <form
          action={updateAccountSettingsAction}
          className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
        >
          <Notice error={params.error} success={params.success} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>Nombre</span>
              <input
                autoComplete="name"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                defaultValue={user.name}
                maxLength={80}
                minLength={2}
                name="name"
                required
                type="text"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>Username</span>
              <input
                autoComplete="username"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                defaultValue={user.username}
                maxLength={20}
                minLength={3}
                name="username"
                pattern="[a-zA-Z0-9_]{3,20}"
                required
                type="text"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>Email</span>
            <input
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              defaultValue={user.email}
              name="email"
              required
              type="email"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>Biografía</span>
            <textarea
              className="min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              defaultValue={user.bio ?? ""}
              maxLength={280}
              name="bio"
              placeholder="Cuenta algo sobre ti en 280 caracteres."
            />
          </label>

          <fieldset className="space-y-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
            <legend className="px-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Modo de apariencia
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["SYSTEM", "Sistema", "Usa la preferencia del dispositivo."],
                ["LIGHT", "Claro", "Fondo claro persistente."],
                ["DARK", "Oscuro", "Fondo oscuro persistente."],
              ].map(([value, label, description]) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 p-4 text-sm transition hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700"
                  key={value}
                >
                  <input
                    className="mt-1"
                    defaultChecked={theme === value}
                    name="theme"
                    type="radio"
                    value={value}
                  />
                  <span>
                    <span className="block font-semibold text-slate-950 dark:text-white">
                      {label}
                    </span>
                    <span className="mt-1 block leading-5 text-slate-600 dark:text-slate-300">
                      {description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
            <h2 className="font-bold text-slate-950 dark:text-white">
              Cambiar contraseña
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Déjalo vacío si no quieres cambiarla. Para guardar una contraseña
              nueva, confirma primero la contraseña actual.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <span>Contraseña actual</span>
                <input
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  name="currentPassword"
                  type="password"
                />
              </label>

              <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <span>Nueva contraseña</span>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  minLength={8}
                  name="newPassword"
                  placeholder="Mínimo 8 caracteres"
                  type="password"
                />
              </label>
            </div>
          </div>

          <SubmitButton>Guardar cambios</SubmitButton>
        </form>

        <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Usuarios bloqueados
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Estas personas no pueden buscarte, solicitarte amistad ni ver tu
              perfil público.
            </p>
          </div>
          {blockedUsers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-5 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No tienes usuarios bloqueados.
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map(({ blocked }) => (
                <article
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                  key={blocked.id}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar user={blocked} />
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">
                        {blocked.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        @{blocked.username}
                      </p>
                    </div>
                  </div>
                  <form action={unblockUserAction}>
                    <input name="userId" type="hidden" value={blocked.id} />
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-200 dark:hover:text-indigo-300"
                      type="submit"
                    >
                      Desbloquear
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
