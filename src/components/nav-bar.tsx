import Link from "next/link";
import type { SessionUser } from "@/server/auth";
import { HexMark } from "./hex";

export function NavBar({ user, links }: { user: SessionUser; links: { href: string; label: string }[] }) {
  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-ink">
            <HexMark className="h-5 w-5" />
            XR Simulation Portal
          </span>
          <nav className="flex gap-5 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>
            {user.displayName} <span className="text-muted/60">({user.role})</span>
          </span>
          <form action="/logout" method="post">
            <button className="rounded-sm border border-line px-3 py-1 text-ink transition-colors hover:border-accent hover:text-accent">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
