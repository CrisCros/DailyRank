type PostPhotoProps = {
  photoUrl: string | null;
  title: string;
  className?: string;
};

export function PostPhoto({ className = "min-h-64", photoUrl, title }: PostPhotoProps) {
  if (!photoUrl) {
    return null;
  }

  return (
    <div
      aria-label={`Foto de ${title}`}
      className={`${className} rounded-[1.75rem] border border-slate-200 bg-slate-100 bg-cover bg-center bg-no-repeat shadow-inner dark:border-slate-800 dark:bg-slate-900`}
      role="img"
      style={{ backgroundImage: `url(${photoUrl})` }}
    />
  );
}
