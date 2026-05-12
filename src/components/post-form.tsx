"use client";

import Link from "next/link";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { MAX_POST_PHOTO_SIZE_BYTES, MAX_POST_PHOTO_SIZE_MB, isImageMimeType } from "@/lib/post-photos";
import { ratingInputValue } from "@/lib/ratings";
import { moodLabels, postMoods, postVisibilities, visibilityLabels } from "@/validations/posts";

type PostFormValues = {
  id?: string;
  rating?: number | string;
  title?: string;
  description?: string | null;
  mood?: string | null;
  visibility?: string;
  photoUrl?: string | null;
};

type PostFormProps = {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  mode: "create" | "edit";
  post?: PostFormValues;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white";

export function PostForm({ action, cancelHref, mode, post }: PostFormProps) {
  const ratingValue = post?.rating ? ratingInputValue(post.rating) : "7";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(post?.photoUrl ?? "");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function updatePreviewUrl(nextPreviewUrl: string) {
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return nextPreviewUrl;
    });
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setPhotoError("");

    if (!file) {
      updatePreviewUrl(removePhoto ? "" : (post?.photoUrl ?? ""));
      return;
    }

    if (!isImageMimeType(file.type)) {
      event.target.value = "";
      updatePreviewUrl(removePhoto ? "" : (post?.photoUrl ?? ""));
      setPhotoError("Selecciona un archivo de imagen.");
      return;
    }

    if (file.size > MAX_POST_PHOTO_SIZE_BYTES) {
      event.target.value = "";
      updatePreviewUrl(removePhoto ? "" : (post?.photoUrl ?? ""));
      setPhotoError(`La foto no puede superar ${MAX_POST_PHOTO_SIZE_MB} MB.`);
      return;
    }

    setRemovePhoto(false);
    updatePreviewUrl(URL.createObjectURL(file));
  }

  function handleRemovePhoto() {
    setPhotoError("");
    setRemovePhoto(true);
    updatePreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form action={action} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      {post?.id ? <input name="postId" type="hidden" value={post.id} /> : null}
      <input name="removePhoto" type="hidden" value={removePhoto ? "1" : "0"} />

      <div className="grid gap-4 sm:grid-cols-[0.45fr_1fr]">
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Nota del día</span>
          <input
            className={inputClass}
            defaultValue={ratingValue}
            max="10"
            min="1"
            name="rating"
            required
            step="0.01"
            type="number"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Título</span>
          <input
            className={inputClass}
            defaultValue={post?.title ?? ""}
            maxLength={120}
            name="title"
            placeholder="Ej. Buen día de avance"
            required
            type="text"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>Descripción opcional</span>
        <textarea
          className={`${inputClass} min-h-36 resize-y`}
          defaultValue={post?.description ?? ""}
          maxLength={1200}
          name="description"
          placeholder="Cuenta brevemente qué ha pasado hoy..."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Estado opcional</span>
          <select className={inputClass} defaultValue={post?.mood ?? ""} name="mood">
            <option value="">Sin estado</option>
            {postMoods.map((mood) => (
              <option key={mood} value={mood}>
                {moodLabels[mood]}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Visibilidad</span>
          <select className={inputClass} defaultValue={post?.visibility ?? "PRIVATE"} name="visibility" required>
            {postVisibilities.map((visibility) => (
              <option key={visibility} value={visibility}>
                {visibilityLabels[visibility]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="photo">
              <Camera className="size-4" /> Foto opcional
            </label>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              En móvil se sugerirá la cámara trasera si el navegador lo soporta. En ordenador podrás elegir una imagen del equipo. Máximo {MAX_POST_PHOTO_SIZE_MB} MB.
            </p>
          </div>
          {previewUrl ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:bg-slate-950 dark:text-rose-200 dark:hover:bg-rose-950/40"
              onClick={handleRemovePhoto}
              type="button"
            >
              <Trash2 className="size-4" /> Quitar foto
            </button>
          ) : null}
        </div>

        {previewUrl ? (
          <div
            aria-label="Vista previa de la foto seleccionada"
            className="min-h-64 rounded-[1.5rem] border border-slate-200 bg-cover bg-center bg-no-repeat shadow-inner dark:border-slate-800"
            role="img"
            style={{ backgroundImage: `url(${previewUrl})` }}
          />
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-950">
            <ImagePlus className="size-10 text-slate-400 dark:text-slate-500" />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Sin foto seleccionada</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Añade una imagen si quieres acompañar tu daily.</p>
          </div>
        )}

        <input
          accept="image/*"
          capture="environment"
          className={inputClass}
          id="photo"
          name="photo"
          onChange={handlePhotoChange}
          ref={fileInputRef}
          type="file"
        />
        {photoError ? <p className="text-sm font-bold text-rose-600 dark:text-rose-300">{photoError}</p> : null}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Link
          className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          href={cancelHref}
        >
          Cancelar
        </Link>
        <div className="sm:min-w-52">
          <SubmitButton pendingText={mode === "create" ? "Creando..." : "Guardando..."}>
            {mode === "create" ? "Guardar mi día" : "Guardar cambios"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
