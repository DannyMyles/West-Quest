"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { adminChangePassword, adminCreate, adminDeleteAccount, adminList, adminUpdateAccount, type AdminAccount } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/context/ToastContext";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const MIN = 10;

export default function AccountPage() {
  const { push } = useToast();
  const { user } = useAdminAuth();

  // --- change my password
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < MIN) return push({ type: "error", message: `Use at least ${MIN} characters` });
    if (next !== again) return push({ type: "error", message: "The new passwords don't match" });
    setSavingPw(true);
    try {
      await adminChangePassword(current, next);
      setCurrent("");
      setNext("");
      setAgain("");
      push({ type: "success", message: "Password changed. Other devices were signed out." });
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't change the password") });
    } finally {
      setSavingPw(false);
    }
  }

  // --- team
  const [admins, setAdmins] = useState<AdminAccount[] | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(() => {
    adminList()
      .then((a) => {
        setAdmins(a);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resetFor, setResetFor] = useState<AdminAccount | null>(null);
  const [resetPw, setResetPw] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await adminCreate(form);
      setForm({ name: "", email: "", password: "" });
      push({ type: "success", message: "Admin added" });
      load();
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't add the admin") });
    } finally {
      setAdding(false);
    }
  }

  async function toggle(a: AdminAccount) {
    try {
      await adminUpdateAccount(a.id, { active: !a.active });
      push({ type: "success", message: a.active ? "Admin deactivated" : "Admin reactivated" });
      load();
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't update the admin") });
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteAccount(pendingDelete.id);
      push({ type: "success", message: "Admin deleted" });
      setPendingDelete(null);
      load();
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't delete the admin") });
    } finally {
      setDeleting(false);
    }
  }

  async function doReset() {
    if (!resetFor) return;
    if (resetPw.length < MIN) return push({ type: "error", message: `Use at least ${MIN} characters` });
    try {
      await adminUpdateAccount(resetFor.id, { password: resetPw });
      push({ type: "success", message: `Password reset for ${resetFor.email}` });
      setResetFor(null);
      setResetPw("");
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't reset the password") });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <section>
        <h1 className="text-xl font-semibold text-ink">My account</h1>
        <p className="mb-6 mt-1 text-sm text-muted">{user?.email}</p>
        <form onSubmit={changePassword} className="flex max-w-sm flex-col gap-3 rounded-2xl border border-border bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <KeyRound className="h-4 w-4" /> Change password
          </h2>
          <input type="password" autoComplete="current-password" required placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className="input" />
          <input type="password" autoComplete="new-password" required minLength={MIN} placeholder={`New password (${MIN}+ characters)`} value={next} onChange={(e) => setNext(e.target.value)} className="input" />
          <input type="password" autoComplete="new-password" required placeholder="Repeat new password" value={again} onChange={(e) => setAgain(e.target.value)} className="input" />
          <AnimatedButton type="submit" variant="primary" isLoading={savingPw}>
            Update password
          </AnimatedButton>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ink">Team</h2>
        <p className="mb-6 mt-1 text-sm text-muted">Everyone here can sign in to this admin.</p>

        {error ? (
          <p className="text-sm text-danger">Couldn&apos;t load the team — is the backend running?</p>
        ) : !admins ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
            {admins.map((a) => (
              <li key={a.id} className={`flex flex-wrap items-center justify-between gap-2 p-4 ${a.active ? "" : "opacity-55"}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {a.name} {a.id === user?.id && <span className="ml-1 text-xs text-muted">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {a.email} · {a.lastLoginAt ? `last in ${new Date(a.lastLoginAt).toLocaleDateString("en-KE")}` : "never signed in"}
                  </p>
                </div>
                {a.id !== user?.id && (
                  <div className="flex items-center gap-3 text-muted">
                    <button onClick={() => setResetFor(a)} className="text-xs font-medium hover:text-brand">
                      Reset password
                    </button>
                    <button onClick={() => toggle(a)} aria-label={a.active ? "Deactivate" : "Reactivate"} className="hover:text-brand">
                      {a.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setPendingDelete(a)} aria-label={`Delete ${a.email}`} className="hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={add} className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-ink">Add an admin</h3>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input" />
          <input required type="password" autoComplete="new-password" minLength={MIN} placeholder={`Temporary password (${MIN}+ characters)`} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input" />
          <AnimatedButton type="submit" variant="primary" isLoading={adding}>
            <Plus className="h-4 w-4" /> Add admin
          </AnimatedButton>
        </form>
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        danger
        busy={deleting}
        title={`Delete ${pendingDelete?.email ?? ""}?`}
        body="They will no longer be able to sign in. Deactivate instead if you might want them back."
        confirmLabel="Delete admin"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <ConfirmDialog
        open={resetFor !== null}
        busy={false}
        title={`Reset password for ${resetFor?.email ?? ""}`}
        confirmLabel="Set new password"
        onConfirm={doReset}
        onCancel={() => {
          setResetFor(null);
          setResetPw("");
        }}
        body={
          <div className="flex flex-col gap-2">
            <span>They&apos;ll be signed out everywhere. Share the new password with them privately.</span>
            <input type="password" autoComplete="new-password" placeholder={`New password (${MIN}+ characters)`} value={resetPw} onChange={(e) => setResetPw(e.target.value)} className="input" />
          </div>
        }
      />
    </div>
  );
}
