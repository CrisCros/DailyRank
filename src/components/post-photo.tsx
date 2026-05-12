type PostPhotoProps = {
  photoUrl: string | null;
  title: string;
  className?: string;
};

export function PostPhoto({ className = "", photoUrl, title }: PostPhotoProps) {
  if (!photoUrl) {
    return null;
  }

  return (
    <div
      aria-label={`Foto de ${title}`}
      className={`${className} aspect-square w-full rounded-[1.5rem] border border-slate-200 bg-slate-100 bg-cover bg-center bg-no-repeat shadow-inner dark:border-slate-800 dark:bg-slate-900`}
      role="img"
      style={{ backgroundImage: `url(${photoUrl})` }}
    />
  );
}
