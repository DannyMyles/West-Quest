"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { ApiError } from "@/lib/api/client";
import { whatsappLink } from "@/lib/contact";
import { cn } from "@/lib/cn";

type Mode = "signin" | "register";
const PASSWORD_MIN = 8;

/** Sign in / create account with phone + password. Calls `onDone` once signed in. */
export function AuthPanel({ initialMode = "signin", onDone }: { initialMode?: Mode; onDone?: () => void }) {
  const { login, register } = useAccount();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const uid = useId();
  const ids = { name: `${uid}-name`, phone: `${uid}-phone`, password: `${uid}-password` };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (mode === "register" && password.length < PASSWORD_MIN) {
      setFieldErrors({ password: `Use at least ${PASSWORD_MIN} characters` });
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") await login(phone, password);
      else await register({ name, phone, password });
      onDone?.();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "PHONE_TAKEN") {
          setMode("signin");
          setError("You already have an account with this number — sign in below.");
        } else {
          const details = Array.isArray(err.details) ? (err.details as { path: string; message: string }[]) : [];
          setFieldErrors(Object.fromEntries(details.map((d) => [d.path, d.message])));
          setError(details.length ? null : err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div role="tablist" className="flex rounded-full bg-surface-muted p-1">
        {(["signin", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
              setFieldErrors({});
            }}
            className={cn("flex-1 rounded-full py-2 text-sm font-semibold transition-colors", mode === m ? "bg-surface text-ink shadow-sm" : "text-ink/60 hover:text-ink")}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        {mode === "register" && (
          <Field id={ids.name} label="Full name" error={fieldErrors.name}>
            <input id={ids.name} aria-describedby={`${ids.name}-help`} className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </Field>
        )}
        <Field id={ids.phone} label="Phone number" error={fieldErrors.phone} hint="The number you use for WhatsApp">
          <input
            id={ids.phone}
            aria-describedby={`${ids.phone}-help`}
            className="field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="07XX XXX XXX"
            required
          />
        </Field>
        <Field id={ids.password} label="Password" error={fieldErrors.password} hint={mode === "register" ? `At least ${PASSWORD_MIN} characters` : undefined}>
          <div className="relative">
            <input
              id={ids.password}
              aria-describedby={`${ids.password}-help`}
              className="field pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {error && (
          <p role="alert" className="rounded-xl bg-danger-050 px-3 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary h-12 w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>

        {mode === "signin" && (
          <p className="text-center text-xs text-muted">
            Forgot your password?{" "}
            <a
              href={whatsappLink("Hi West Quest, I've forgotten my account password.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline underline-offset-2 hover:text-brand"
            >
              Message us on WhatsApp
            </a>
          </p>
        )}
      </form>
    </div>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      <span id={`${id}-help`} className={error ? "mt-1 block text-xs text-danger" : "mt-1 block text-xs text-muted"}>
        {error ?? hint}
      </span>
    </div>
  );
}
