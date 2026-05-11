import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import { moodLabels, postMoods, postVisibilities, visibilityLabels } from "@/validations/posts";

type PostFormValues = {
  id?: string;
  rating?: number;
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
  return (
    <form action={action} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      {post?.id ? <input name="postId" type="hidden" value={post.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-[0.45fr_1fr]">
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Nota del día</span>
          <input
            className={inputClass}
            defaultValue={post?.rating ?? 7}
            max={10}
            min={1}
            name="rating"
            required
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

      <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>Foto opcional</span>
        <input name="photoUrl" type="hidden" value={post?.photoUrl ?? ""} />
        <input className={inputClass} defaultValue={post?.photoUrl ?? ""} disabled placeholder="Subida de fotos preparada para una fase posterior" type="text" />
        <span className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          La base de datos ya contempla foto, pero la subida a Cloudinary queda pendiente para no ampliar el alcance de esta fase.
        </span>
      </label>

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
