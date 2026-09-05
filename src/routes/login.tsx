import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/app-shell";
import { AuthLoading, useAuth } from "@/components/auth-provider";
import { authService } from "@/services/authService";
import { friendlyError } from "@/services/firestore-helpers";
import { DEMO_MODE } from "@/lib/demo";
import { APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in · Lexion" },
      {
        name: "description",
        content: "Log in to Lexion to reopen your submissions, analyses and personalised study notes.",
      },
      { property: "og:title", content: "Log in · Lexion" },
      { property: "og:description", content: "Understand your language. Improve through your own work." },
    ],
  }),
  component: LoginPage,
});

export function GoogleButton({ label, onDone }: { label: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await authService.signInWithGoogle();
          onDone();
        } catch (error) {
          toast.error(friendlyError(error, "We couldn't sign you in with Google. Please try again."));
        } finally {
          setBusy(false);
        }
      }}
      className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
    >
      {busy ? "Connecting to Google…" : label}
    </button>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="surface-card p-7">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const fieldClass =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30";

function LoginPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!DEMO_MODE && status === "authenticated") void navigate({ to: "/dashboard", replace: true });
  }, [status, navigate]);

  if (!DEMO_MODE && (status === "loading" || status === "authenticated"))
    return <AuthLoading label="Checking your session…" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (DEMO_MODE) {
      // DEMO_MODE: ignore any entered values, no Firebase Auth request.
      void navigate({ to: "/dashboard", replace: true });
      return;
    }
    setBusy(true);
    try {
      await authService.signInWithEmail(email.trim(), password);
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(friendlyError(error, "We couldn't log you in. Please check your details and try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back." subtitle={`Log in to continue where you left off in ${APP_NAME}.`}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input id="email" type="email" required={!DEMO_MODE} value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            required={!DEMO_MODE}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Continue with Google" onDone={() => void navigate({ to: "/dashboard", replace: true })} />

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to="/reset-password" className="text-muted-foreground hover:text-foreground">
          Forgot your password?
        </Link>
        <Link to="/signup" className="font-medium text-primary hover:underline underline-offset-4">
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}
