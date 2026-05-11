type NoticeProps = {
  error?: string;
  success?: string;
};

export function Notice({ error, success }: NoticeProps) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      className={
        error
          ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
      }
      role="status"
    >
      {error ?? success}
    </div>
  );
}
