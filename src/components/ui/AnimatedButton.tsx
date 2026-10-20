"use client";

import Link from "next/link";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "whatsapp";
const MotionLink = motion.create(Link);

interface Props extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-sm hover:bg-brand-strong",
  secondary: "bg-surface-muted text-ink hover:bg-brand-050 hover:text-brand",
  ghost: "bg-transparent text-ink hover:bg-black/5",
  dark: "bg-panel-dark text-white hover:bg-panel-dark-2",
  whatsapp: "bg-whatsapp text-white shadow-sm hover:brightness-95",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-60";

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  isLoading = false,
  disabled,
  ...props
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {isLoading && <Spinner className="h-4 w-4" />}
      {children as React.ReactNode}
    </motion.button>
  );
}

interface LinkProps {
  href: string;
  variant?: Variant;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  target?: string;
  rel?: string;
}

export function AnimatedLinkButton({ children, className, variant = "primary", ...props }: LinkProps) {
  return (
    <MotionLink
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
    </MotionLink>
  );
}
