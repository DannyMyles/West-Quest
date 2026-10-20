import { api } from "./client";

export interface ImageEntry {
  /** The image's id (as a string) — pass it back to reorder/delete. */
  file: string;
  position: number;
  size: number;
  url: string;
}
export interface ImageList {
  max: number;
  images: ImageEntry[];
}

export const adminImages = (productId: number) => api<ImageList>(`/admin/products/${productId}/images`);

export function adminUploadImages(productId: number, files: File[]) {
  const form = new FormData();
  for (const f of files) form.append("images", f, f.name);
  return api<{ created: string[] } & ImageList>(`/admin/products/${productId}/images`, {
    method: "POST",
    form,
  });
}

/** `files` = every image id in the new order — the first becomes the primary photo. */
export const adminReorderImages = (productId: number, files: string[]) =>
  api<ImageList>(`/admin/products/${productId}/images/order`, { method: "PUT", json: { files } });

export const adminDeleteImage = (productId: number, file: string) =>
  api<ImageList>(`/admin/products/${productId}/images/${encodeURIComponent(file)}`, { method: "DELETE" });
