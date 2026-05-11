"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: string;
  pendingText?: string;
};

export function SubmitButton({ children, pendingText = "Guardando..." }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingText : children}
    </button>
  );
}
