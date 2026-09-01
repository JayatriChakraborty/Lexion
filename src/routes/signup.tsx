import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLoading, useAuth } from "@/components/auth-provider";
import { AuthShell, GoogleButton, fieldClass } from "./login";
import { authService } from "@/services/authService";
import { friendlyError } from "@/services/firestore-helpers";
import { APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account · Lexion" },
      {
        name: "description",
        content: "Create a Lexion account to keep every submission, analysis and study note in one private workspace.",
      },
      { property: "og:title", content: "Create your account · Lexion" },
      { property: "og:description", content: "Understand your language. Improve through your own work." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") void navigate({ to: "/dashboard", replace: true });
  }, [status, navigate]);

  if (status === "loading" || status === "authenticated") return <AuthLoading label="Checking your session…" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.signUpWithEmail(email.trim(), password, name.trim());
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(friendlyError(error, "We couldn't create your account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={`${APP_NAME} keeps your submissions and analyses private to you.`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Display name
          </label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">At least six characters.</p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Sign up with Google" onDone={() => void navigate({ to: "/dashboard", replace: true })} />

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
