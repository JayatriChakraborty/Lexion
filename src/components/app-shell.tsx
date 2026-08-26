import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home,
  ScanText,
  History,
  NotebookPen,
  AlertCircle,
  LineChart,
  Languages as LanguagesIcon,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/mock-data";

const mainNav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/analyse", label: "Analyse", icon: ScanText },
  { to: "/history", label: "History", icon: History },
  { to: "/study", label: "Study Notes", icon: NotebookPen },
  { to: "/mistakes", label: "Mistake Bank", icon: AlertCircle },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/languages", label: "Languages", icon: LanguagesIcon },
] as const;

const bottomNav = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/profile", label: "Settings", icon: Settings },
] as const;

const mobileNav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/analyse", label: "Analyse", icon: ScanText },
  { to: "/history", label: "History", icon: History },
  { to: "/study", label: "Notes", icon: NotebookPen },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
        L
      </span>
      {!compact && (
        <span className="text-[17px] font-bold tracking-tight text-foreground">{APP_NAME}</span>
      )}
    </span>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.9} />
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const sidebar = (onClick?: () => void) => (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-2">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {mainNav.map((item) => (
          <NavItem key={item.label} {...item} active={path === item.to} onClick={onClick} />
        ))}
      </nav>
      <nav className="flex flex-col gap-1 border-t border-sidebar-border pt-4">
        {bottomNav.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            active={path === item.to && item.label === "Profile"}
            onClick={onClick}
          />
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        {sidebar()}
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="grid size-9 place-items-center rounded-lg border border-border text-foreground"
        >
          {open ? <Menu className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar shadow-lift">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 grid size-9 place-items-center rounded-lg text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            {sidebar(() => setOpen(false))}
          </div>
        </div>
      )}

      <main className="pb-24 lg:pb-0 lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        {[...mobileNav, { to: "/profile", label: "Profile", icon: User }].map((item) => {
          const active = path === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
