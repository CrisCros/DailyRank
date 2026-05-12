export const MAX_POST_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_POST_PHOTO_SIZE_MB = MAX_POST_PHOTO_SIZE_BYTES / (1024 * 1024);

export function isImageMimeType(type: string) {
  return type.startsWith("image/");
}
