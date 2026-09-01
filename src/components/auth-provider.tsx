import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { User } from "firebase/auth";
import { authService } from "@/services/authService";
import { profileService, type Profile } from "@/services/profileService";
import { Logo } from "@/components/app-shell";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  uid: string | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  user: null,
  uid: null,
  profile: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const unsubscribe = authService.observe(async (next) => {
      setUser(next);
      setStatus(next ? "authenticated" : "unauthenticated");
      if (next) {
        try {
          setProfile(await profileService.get(next.uid));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      uid: user?.uid ?? null,
      profile,
      signOut: async () => {
        await authService.signOut();
      },
      refreshProfile: async () => {
        if (user) setProfile(await profileService.get(user.uid));
      },
    }),
    [status, user, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthLoading({ label = "Preparing your workspace…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <Logo />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/** Gates every protected page. Never renders app content while auth is resolving. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (status === "unauthenticated") {
      void navigate({ to: "/login", search: { redirect: pathname }, replace: true });
    }
  }, [status, navigate, pathname]);

  if (status !== "authenticated") return <AuthLoading />;
  return <>{children}</>;
}
