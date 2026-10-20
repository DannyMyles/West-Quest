"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab focus inside the returned ref while `active`, moves focus in on
 * open, restores it to the previously focused element on close, and calls
 * `onEscape` when Escape is pressed.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  onEscape?: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const preferred = node.querySelector<HTMLElement>("[data-autofocus]");
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      (preferred ?? focusable[0] ?? node).focus();
    };
    focusFirst();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        node!.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      previouslyFocused?.focus?.();
    };
  }, [active, onEscape]);

  return ref;
}
