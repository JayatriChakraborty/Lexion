import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, fieldClass } from "./login";
import { authService } from "@/services/authService";
import { friendlyError } from "@/services/firestore-helpers";
import { DEMO_MODE } from "@/lib/demo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your password · Lexion" },
      {
        name: "description",
        content: "Send yourself a password reset email and get back into your Lexion language workspace.",
      },
      { property: "og:title", content: "Reset your password · Lexion" },
      { property: "og:description", content: "Recover access to your private Lexion workspace." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (DEMO_MODE) {
      // DEMO_MODE: no Firebase Auth request — just show the confirmation state.
      setSent(true);
      return;
    }
    setBusy(true);
    try {
      await authService.sendReset(email.trim());
      setSent(true);
    } catch (error) {
      toast.error(friendlyError(error, "We couldn't send the reset email. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new password."
    >
      {sent ? (
        <div className="rounded-lg border border-border bg-secondary/50 p-4">
          <p className="text-sm font-medium text-foreground">Check your inbox.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            If an account exists for {email}, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link to="/login" className="font-medium text-primary hover:underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
