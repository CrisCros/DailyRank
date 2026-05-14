"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

import { removeAvatarAction, updateAvatarAction } from "@/app/actions/settings";
import { SubmitButton } from "@/components/submit-button";
import { UserAvatar } from "@/components/user-avatar";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB, isImageMimeType } from "@/lib/post-photos";


type AvatarSettingsFormProps = {
  user: {
    name: string;
    username: string;
    image: string | null;
  };
};

export function AvatarSettingsForm({ user }: AvatarSettingsFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => previewUrl, [previewUrl]);

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
      <div>
        <h2 className="font-bold text-slate-950 dark:text-white">
          Foto de perfil
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Sube una imagen de hasta {MAX_IMAGE_SIZE_MB} MB. En móvil puedes usar cámara o galería.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative size-24 overflow-hidden rounded-full">
          {preview ? (
            <Image
              unoptimized
              alt="Preview de avatar"
              className="object-cover"
              fill
              sizes="96px"
              src={preview}
            />
          ) : (
            <UserAvatar user={user} size="xl" />
          )}
        </div>

        <form action={updateAvatarAction} className="flex-1 space-y-3">
          <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300">
            <span className="inline-flex items-center gap-2">
              <Camera className="size-4" /> Elegir imagen
            </span>
            <input
              accept="image/*"
              capture="environment"
              className="sr-only"
              name="avatar"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                }
                setError(null);
                setPreviewUrl(null);

                if (!file) {
                  return;
                }

                if (!isImageMimeType(file.type)) {
                  setError("El avatar debe ser una imagen.");
                  event.target.value = "";
                  return;
                }

                if (file.size > MAX_IMAGE_SIZE_BYTES) {
                  setError(`La imagen no puede superar ${MAX_IMAGE_SIZE_MB} MB.`);
                  event.target.value = "";
                  return;
                }

                setPreviewUrl(URL.createObjectURL(file));
              }}
            />
          </label>

          {error ? (
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">
              {error}
            </p>
          ) : null}
          {preview ? (
            <SubmitButton pendingText="Subiendo...">
              Guardar avatar
            </SubmitButton>
          ) : null}
        </form>
      </div>

      {user.image ? (
        <form action={removeAvatarAction}>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-200 dark:hover:bg-rose-950/40"
            type="submit"
          >
            <Trash2 className="size-4" /> Quitar foto
          </button>
        </form>
      ) : null}
    </section>
  );
}
