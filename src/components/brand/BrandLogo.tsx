import Image from "next/image";
import { cn } from "@/lib/cn";

/** West Quest logo: the gold WQ monogram beside the "WEST QUEST / LIMITED"
 *  wordmark. `tone="dark"` is for dark backgrounds (brighter gold, white text).
 *  Source artwork: public/brand/*.svg. */
export function BrandLogo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <span className={cn("flex items-center gap-2 sm:gap-2.5", className)}>
      <Image
        src={dark ? "/brand/west-quest-mark-bright.svg" : "/brand/west-quest-mark.svg"}
        alt=""
        width={52}
        height={44}
        priority
        unoptimized
        className="h-8 w-auto sm:h-10"
      />
      <span className="flex flex-col leading-none">
        <span className={cn("whitespace-nowrap font-display text-[15px] font-medium tracking-[0.1em] sm:text-[19px] sm:tracking-[0.16em]", dark ? "text-white" : "text-ink")}>WEST QUEST</span>
        <span className={cn("mt-1 pl-[1px] text-[7.5px] font-semibold tracking-[0.38em] sm:text-[8.5px] sm:tracking-[0.44em]", dark ? "text-[#c49a4c]" : "text-[#8a6326]")}>LIMITED</span>
      </span>
    </span>
  );
}
