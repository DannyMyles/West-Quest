"use client";

import { useEffect, useState } from "react";

export interface PhotoInfo {
  /** The photo sits on a (near-)white background. */
  onWhite: boolean;
  /** Dominant colour of the product itself as "r,g,b", or null if it's neutral (black/grey/white). */
  tint: string | null;
}

const NEUTRAL: PhotoInfo = { onWhite: false, tint: null };
const cache = new Map<string, PhotoInfo>();
const pending = new Map<string, Promise<PhotoInfo>>();

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h / 6, s, l };
}

function analyse(img: HTMLImageElement): PhotoInfo {
  const w = 48;
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return NEUTRAL;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Edge pixels decide "on white"; every pixel votes for a hue bin, weighted
  // by how colourful it is, to find the product's dominant colour.
  const BINS = 24;
  const weight = new Float64Array(BINS);
  const sums = Array.from({ length: BINS }, () => [0, 0, 0]);
  let light = 0;
  let edge = 0;
  let totalWeight = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (x <= 1 || x >= w - 2 || y <= 1 || y >= h - 2) {
        if (a < 16 || (r > 249 && g > 249 && b > 249)) light++;
        edge++;
      }
      if (a < 128) continue;
      const { h: hue, s, l } = rgbToHsl(r, g, b);
      if (l > 0.92 || l < 0.1 || s < 0.18) continue;
      const wgt = s * (1 - Math.abs(l - 0.5) * 1.4);
      if (wgt <= 0) continue;
      const bin = Math.floor(hue * BINS) % BINS;
      weight[bin] += wgt;
      sums[bin][0] += r * wgt;
      sums[bin][1] += g * wgt;
      sums[bin][2] += b * wgt;
      totalWeight += wgt;
    }
  }

  let best = 0;
  for (let k = 1; k < BINS; k++) if (weight[k] > weight[best]) best = k;
  const colourful = totalWeight > w * h * 0.02;
  const tint = colourful ? sums[best].map((v) => Math.round(v / weight[best])).join(",") : null;
  return { onWhite: light / edge > 0.93, tint };
}

/** Analyses a photo: whether it's shot on white (edge pixels) and the
 *  product's dominant colour. Same-origin images only — a tainted canvas or a
 *  load error resolves to "not on white, no tint". Cached per URL. */
export function inspectPhoto(src: string): Promise<PhotoInfo> {
  const known = cache.get(src);
  if (known) return Promise.resolve(known);
  const inflight = pending.get(src);
  if (inflight) return inflight;
  const p = new Promise<PhotoInfo>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        resolve(analyse(img));
      } catch {
        resolve(NEUTRAL);
      }
    };
    img.onerror = () => resolve(NEUTRAL);
    img.src = src;
  }).then((info) => {
    cache.set(src, info);
    pending.delete(src);
    return info;
  });
  pending.set(src, p);
  return p;
}

/** Whether `src` is shot on white: `null` until known. */
export function usePhotoOnWhite(src: string | undefined) {
  const [result, setResult] = useState<{ src: string; onWhite: boolean } | null>(null);

  useEffect(() => {
    if (!src || cache.has(src)) return;
    let cancelled = false;
    inspectPhoto(src).then((info) => {
      if (!cancelled) setResult({ src, onWhite: info.onWhite });
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src) return null;
  if (cache.has(src)) return cache.get(src)!.onWhite;
  return result?.src === src ? result.onWhite : null;
}

/** The first of `srcs` shot on white (checked in order, at most `limit`),
 *  else the first one, with that photo's tint. `null` while checking. */
export function useBestPhoto(srcs: string[], limit = 8) {
  const key = srcs.slice(0, limit).join("|");
  const [result, setResult] = useState<{ key: string; src: string; info: PhotoInfo } | null>(null);

  useEffect(() => {
    const list = key ? key.split("|") : [];
    if (!list.length) return;
    let cancelled = false;
    (async () => {
      for (const src of list) {
        const info = await inspectPhoto(src);
        if (info.onWhite) {
          if (!cancelled) setResult({ key, src, info });
          return;
        }
      }
      const info = await inspectPhoto(list[0]);
      if (!cancelled) setResult({ key, src: list[0], info });
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return result?.key === key ? { src: result.src, onWhite: result.info.onWhite, tint: result.info.tint } : null;
}
