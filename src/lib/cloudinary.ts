import { createHash } from "node:crypto";

import { MAX_POST_PHOTO_SIZE_BYTES, MAX_POST_PHOTO_SIZE_MB, isImageMimeType } from "@/lib/post-photos";

export type PhotoUploadResult = {
  secureUrl: string;
};

export function isImageFile(file: File) {
  return isImageMimeType(file.type);
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "dayrank/posts";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Configura CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET para subir fotos.");
  }

  return { apiKey, apiSecret, cloudName, folder };
}

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export function validatePostPhotoFile(file: File) {
  if (file.size === 0) {
    return;
  }

  if (!isImageFile(file)) {
    throw new Error("La foto debe ser un archivo de imagen.");
  }

  if (file.size > MAX_POST_PHOTO_SIZE_BYTES) {
    throw new Error(`La foto no puede superar ${MAX_POST_PHOTO_SIZE_MB} MB.`);
  }
}

export async function uploadPostPhotoToCloudinary(file: File): Promise<PhotoUploadResult | null> {
  if (file.size === 0) {
    return null;
  }

  validatePostPhotoFile(file);

  const { apiKey, apiSecret, cloudName, folder } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const signedParams = { folder, timestamp };
  const signature = signCloudinaryParams(signedParams, apiSecret);
  const formData = new FormData();

  formData.set("file", file);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("folder", folder);
  formData.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("No se pudo subir la foto a Cloudinary. Inténtalo de nuevo.");
  }

  const payload = (await response.json()) as { secure_url?: unknown };

  if (typeof payload.secure_url !== "string" || payload.secure_url.length === 0) {
    throw new Error("Cloudinary no devolvió una URL válida para la foto.");
  }

  return { secureUrl: payload.secure_url };
}
