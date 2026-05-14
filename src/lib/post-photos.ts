export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const MAX_POST_PHOTO_SIZE_MB = MAX_IMAGE_SIZE_MB;
export const MAX_POST_PHOTO_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;

export function isImageMimeType(type: string) {
  return type.startsWith("image/");
}
