"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Pause, Play } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";
import { useCountdownTo } from "@/hooks/useCountdown";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useBestPhoto } from "@/hooks/usePhotoOnWhite";
import { cn } from "@/lib/cn";
import type { Banner } from "@/lib/types";

const AUTOPLAY_MS = 6500;
const SWIPE_PX = 50;
/** Primary-button colour when a slide has no accent of its own (fired clay). */
const DEFAULT_ACCENT = "#b5481f";

const FACTS = [
  { label: "Deposit", value: "from 20%" },
  { label: "Terms", value: "6 · 9 · 12 months" },
  { label: "Approval", value: "over WhatsApp" },
];

/** Black or white — whichever reads better on `hex` (WCAG relative luminance). */
function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (lum + 0.05) / 0.05 > 1.05 / (lum + 0.05) ? "#241a12" : "#ffffff";
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Soft tones for products with no colour of their own (black/grey/white). */
const NEUTRAL_TONES = ["111,150,128", "112,146,190", "201,132,112", "150,128,190", "196,152,82", "96,160,158"];
const PAPER = [251, 246, 238];

/** Normalises a product colour to a mid-tone (keeps hue, evens out
 *  saturation/lightness) so every slide tints with similar strength. */
function tone(rgb: string) {
  const [r, g, b] = rgb.split(",").map((n) => Number(n) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  const l0 = (max + min) / 2;
  const s0 = d ? d / (1 - Math.abs(2 * l0 - 1)) : 0;
  const s = Math.min(0.6, Math.max(0.35, s0));
  const l = 0.52;
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [f(0), f(8), f(4)];
}

const mix = (c: number[], amount: number) => `rgb(${c.map((v, i) => Math.round(v * amount + PAPER[i] * (1 - amount))).join(",")})`;

function slidePalette(tint: string) {
  const c = tone(tint);
  return {
    bg: mix(c, 0.2),
    disc: mix(c, 0.36),
    glow: `rgba(${c.join(",")},0.38)`,
    line: `rgba(${c.join(",")},0.16)`,
    ring: `rgba(${c.join(",")},0.55)`,
  };
}

/** Homepage promo carousel. "Product" slides are light and editorial: a big
 *  serif headline beside the device on a sand "stamp", with its price as a
 *  floating tag. "Photo" slides fill the frame with a lifestyle picture under
 *  a dark wash. Autoplay (with a progress bar) pauses on hover/focus or via
 *  the pause button; touch users can swipe. */
export function HeroCarousel() {
  const { banners, loading } = useBanners();
  const reduced = useReducedMotion();
  const count = banners.length;

  // `prev` stays fully visible underneath while `index` fades in on top, so
  // the cross-fade never shows the backdrop through two half-faded slides.
  const [{ index, prev: previous }, setSlide] = useState({ index: 0, prev: -1 });
  const show = useCallback((n: number) => setSlide((s) => (n === s.index ? s : { index: n, prev: s.index })), []);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((next: number) => show(((next % count) + count) % count), [count, show]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  const playing = count > 1 && !reduced && !stopped && !hovered && !focused;
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => show((index + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, index, count, show]);

  if (!loading && count === 0) return null;
  const current = banners[index];
  const darkSlide = current ? current.layout !== "product" : false;

  return (
    <section className="section pt-4 sm:pt-6" aria-roledescription="carousel" aria-label="Promotions">
      <div
        className="group/hero relative min-h-[720px] overflow-hidden rounded-[28px] bg-surface-muted sm:min-h-0 sm:h-[580px] sm:rounded-[32px] lg:h-[640px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") prev();
          else if (e.key === "ArrowRight") next();
        }}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (dx < -SWIPE_PX) next();
          else if (dx > SWIPE_PX) prev();
        }}
      >
        {loading && count === 0 && <div className="absolute inset-0 animate-shimmer" />}

        {banners.map((b, i) => (
          <Slide key={b.id} banner={b} index={i} active={i === index} behind={i === previous} first={i === 0} label={`${i + 1} of ${count}`} reduced={reduced} />
        ))}

        {/* bottom bar: key facts (left) + slide controls (right) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6 pb-6 sm:px-10 sm:pb-8 lg:px-16">
          <div className="flex items-end justify-between gap-6">
            <dl className={cn("hidden gap-8 lg:flex", darkSlide ? "text-white" : "text-ink")}>
              {FACTS.map((f) => (
                <div key={f.label}>
                  <dt className={cn("font-mono text-[10.5px] uppercase tracking-[0.16em]", darkSlide ? "text-white/55" : "text-muted")}>{f.label}</dt>
                  <dd className="mt-1 text-sm font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>

            {count > 1 && (
              <div className="pointer-events-auto mx-auto flex items-center gap-4 sm:mx-0 sm:ml-auto">
                <span className={cn("font-mono text-xs tabular-nums", darkSlide ? "text-white/70" : "text-muted")}>
                  <span className={darkSlide ? "text-white" : "text-ink"}>{pad(index + 1)}</span> / {pad(count)}
                </span>
                <div className="flex items-center gap-1.5">
                  {banners.map((b, i) => (
                    <button key={b.id} type="button" aria-label={`Show slide ${i + 1}`} aria-current={i === index} onClick={() => go(i)} className="py-2">
                      <span className={cn("relative block h-[3px] w-7 overflow-hidden rounded-full sm:w-9", darkSlide ? "bg-white/25" : "bg-ink/12")}>
                        {i < index && <span className={cn("absolute inset-0", darkSlide ? "bg-white" : "bg-ink/70")} />}
                        {i === index && (
                          <span
                            key={`${index}-${playing}`}
                            className={cn("absolute inset-0 origin-left", darkSlide ? "bg-white" : "bg-brand")}
                            style={
                              playing
                                ? { animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards` }
                                : undefined
                            }
                          />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                {!reduced && (
                  <button
                    type="button"
                    onClick={() => setStopped((s) => !s)}
                    aria-label={stopped ? "Play slideshow" : "Pause slideshow"}
                    className={cn("hidden p-1 transition-colors sm:block", darkSlide ? "text-white/70 hover:text-white" : "text-muted hover:text-ink")}
                  >
                    {stopped ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
                  </button>
                )}
                <div className="hidden items-center gap-2 sm:flex">
                  <ArrowButton side="left" onClick={prev} dark={darkSlide} />
                  <ArrowButton side="right" onClick={next} dark={darkSlide} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowButton({ side, onClick, dark }: { side: "left" | "right"; onClick: () => void; dark: boolean }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      onClick={onClick}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        dark ? "bg-white/15 text-white backdrop-blur hover:bg-white hover:text-ink" : "bg-surface text-ink shadow-md hover:bg-ink hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}

/** The device on a sand "stamp" disc with its price as a floating tag. A
 *  photo shot on white is multiply-blended so its background vanishes into
 *  the paper; any other photo is cropped into the disc, so neither ever
 *  shows as a framed rectangle. */
function ProductStage({
  best,
  palette,
  badge,
  active,
  motion,
}: {
  best: { src: string; onWhite: boolean } | null;
  palette: ReturnType<typeof slidePalette>;
  badge?: string;
  active: boolean;
  motion: string;
}) {
  const src = best?.src;
  const onWhite = best ? best.onWhite : null;
  const shown = active && best !== null;
  const enter = cn("transition-all ease-out", motion, shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0");

  return (
    <div className="relative flex aspect-square h-full max-h-[min(100%,500px)] items-center justify-center">
      <span aria-hidden className="absolute inset-[2%] rounded-full border border-dashed transition-colors duration-700" style={{ borderColor: palette.ring }} />
      {onWhite === false ? (
        <div className={cn("relative h-[86%] w-[86%] overflow-hidden rounded-full shadow-xl", enter)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} className="h-full w-full object-cover transition-transform duration-700 group-hover/hero:scale-[1.04]" />
        </div>
      ) : (
        <>
          <span aria-hidden className="absolute inset-[7%] rounded-full transition-colors duration-700" style={{ backgroundColor: palette.disc }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            className={cn("relative h-[80%] w-[80%] object-contain blend-white group-hover/hero:scale-[1.03]", enter)}
          />
        </>
      )}

      {badge && (
        <div
          className={cn(
            "tag-hole absolute -left-2 bottom-[4%] whitespace-nowrap rounded-2xl bg-surface py-2.5 pl-8 pr-4 shadow-lg transition-all ease-out sm:-left-4 sm:bottom-[8%] sm:py-3 sm:pl-9 sm:pr-5",
            motion,
            shown ? "translate-y-0 opacity-100 delay-300" : "translate-y-3 opacity-0"
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{badge.includes("/day") ? "Pay as you go" : "Prices from"}</p>
          <p className="font-display text-lg font-semibold leading-tight text-accent sm:text-2xl">{badge}</p>
        </div>
      )}
    </div>
  );
}

interface SlideProps {
  banner: Banner;
  index: number;
  active: boolean;
  /** The slide being faded over: held fully opaque beneath the active one. */
  behind: boolean;
  first: boolean;
  label: string;
  reduced: boolean;
}

function Slide({ banner, index, active, behind, first, label, reduced }: SlideProps) {
  const product = banner.layout === "product";
  const best = useBestPhoto(product ? (banner.images?.length ? banner.images : [banner.image]) : []);
  const palette = slidePalette(best?.tint ?? NEUTRAL_TONES[index % NEUTRAL_TONES.length]);
  const accent = banner.accent ?? DEFAULT_ACCENT;
  const onAccent = readableOn(accent);
  const countdown = useCountdownTo(banner.dealEndsAt);
  const showCountdown = banner.dealEndsAt && !countdown.done;
  const motion = reduced ? "duration-0" : "duration-700";
  const reveal = (delay: string) =>
    cn("transition-all ease-out", reduced ? "duration-0" : `duration-700 ${delay}`, active ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0");

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      className={cn(
        "absolute inset-0",
        active ? cn("z-20 opacity-100 transition-opacity ease-out", motion) : behind ? "z-10 opacity-100" : "z-0 opacity-0"
      )}
    >
      {product ? (
        // Tinted with the product's own colour: paper wash, ruled lines and a glow behind it.
        <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: palette.bg }}>
          <div
            className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent_5%,black_60%)]"
            style={{ backgroundImage: `repeating-linear-gradient(0deg,transparent 0 39px,${palette.line} 39px 40px)` }}
          />
          <div
            className="absolute -right-[10%] top-1/2 aspect-square h-[130%] -translate-y-1/2 rounded-full"
            style={{ backgroundImage: `radial-gradient(circle, ${palette.glow}, transparent 62%)` }}
          />
        </div>
      ) : (
        <>
          <Image src={banner.image} alt="" fill priority={first} unoptimized sizes="(min-width: 1600px) 1600px, 100vw" className="object-cover" draggable={false} />
          <div className="absolute inset-0 bg-linear-to-t from-[#21170f]/90 via-[#21170f]/55 to-transparent sm:bg-linear-to-r sm:from-[#21170f]/90 sm:via-[#21170f]/55 sm:to-transparent" />
        </>
      )}

      <div
        className={cn(
          "relative mx-auto grid h-full max-w-[1320px] grid-rows-[auto_minmax(0,1fr)] gap-4 px-6 pb-16 pt-9 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:grid-rows-1 sm:items-center sm:gap-10 sm:px-10 sm:pb-24 sm:pt-0 lg:gap-16 lg:px-16",
          product ? "text-ink" : "text-white"
        )}
      >
        <div className="max-w-[600px]">
          {(banner.eyebrow || showCountdown || (!product && banner.badge)) && (
            <div className={cn("mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-7", reveal("delay-75"))}>
              {banner.eyebrow && (
                <span className={cn("flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.2em]", product ? "text-brand" : "text-glow")}>
                  <span aria-hidden className={cn("h-px w-8", product ? "bg-brand/50" : "bg-glow/60")} />
                  {banner.eyebrow}
                </span>
              )}
              {!product && banner.badge && (
                <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.08em]" style={{ backgroundColor: accent, color: onAccent }}>
                  {banner.badge}
                </span>
              )}
              {showCountdown && (
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs tabular-nums", product ? "bg-surface text-ink" : "bg-white/10")}>
                  <Clock className="h-3.5 w-3.5" />
                  Ends in {countdown.hours}:{countdown.minutes}:{countdown.seconds}
                </span>
              )}
            </div>
          )}

          <h2
            className={cn(
              "text-balance font-display text-[38px] font-medium leading-[1] tracking-[-0.025em] sm:text-[52px] lg:text-[68px]",
              reveal("delay-150")
            )}
          >
            {banner.headline}
          </h2>

          {banner.subcopy && (
            <p className={cn("mt-4 max-w-md text-pretty text-[15px] leading-relaxed sm:mt-6 sm:text-lg", product ? "text-muted" : "text-white/75", reveal("delay-200"))}>
              {banner.subcopy}
            </p>
          )}

          {((banner.cta2Label && banner.cta2Href) || (banner.ctaLabel && banner.ctaHref)) && (
            <div className={cn("mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-10", reveal("delay-300"))}>
              {banner.ctaLabel && banner.ctaHref && (
                <Link
                  href={banner.ctaHref}
                  className="group/cta inline-flex h-12 items-center gap-2.5 rounded-xl px-7 text-[15px] font-semibold shadow-md transition hover:brightness-[0.92]"
                  style={{ backgroundColor: accent, color: onAccent }}
                >
                  {banner.ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
              )}
              {banner.cta2Label && banner.cta2Href && (
                <Link
                  href={banner.cta2Href}
                  className={cn(
                    "text-[15px] font-semibold underline decoration-2 underline-offset-[7px] transition-colors",
                    product ? "decoration-brand/35 hover:text-brand hover:decoration-brand" : "decoration-white/40 hover:decoration-white"
                  )}
                >
                  {banner.cta2Label}
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="relative flex h-full min-h-0 items-center justify-center sm:py-12">
          {product && <ProductStage best={best} palette={palette} badge={banner.badge} active={active} motion={motion} />}
        </div>
      </div>
    </div>
  );
}
