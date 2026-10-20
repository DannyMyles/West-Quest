"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { submitReview } from "@/lib/api/reviews";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { cn } from "@/lib/cn";

export function ReviewForm({ sku, productName }: { sku: string; productName: string }) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success-050 p-4 text-sm text-ink">
        <Check className="h-4 w-4 text-success" /> Thanks! Your review will appear once it&apos;s approved.
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary mt-4">
        <Star className="h-4 w-4" /> Write a review
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || rating < 1 || !comment.trim()) {
      push({ type: "error", message: "Add your name, a rating and a comment" });
      return;
    }
    setBusy(true);
    try {
      await submitReview({ productSku: sku, customerName: name.trim(), rating, comment: comment.trim() });
      setDone(true);
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't submit right now — try again shortly") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl mt-4 flex flex-col gap-3 bg-surface shadow-md p-4">
      <p className="text-sm font-semibold text-ink">Review {productName}</p>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star className={cn("h-6 w-6 transition-colors", (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-border-strong")} />
          </button>
        ))}
      </div>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="field" autoComplete="name" />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="What did you like? How's the build, battery, value?"
        className="field"
      />

      <div className="flex gap-2">
        <AnimatedButton type="submit" variant="primary" isLoading={busy} className="flex-1">
          Submit review
        </AnimatedButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
      <p className="text-xs text-muted">Reviews are checked before they&apos;re published.</p>
    </form>
  );
}
