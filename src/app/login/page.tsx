"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { HexMark } from "@/components/hex";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <main className="hex-field flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm border border-line bg-surface p-8">
        <HexMark className="h-9 w-9" />
        <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">
          XR Simulation Portal
        </h1>
        <p className="mt-1 text-sm text-muted">Sign in to continue.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-ink">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoFocus
              className="mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          {state?.error && <p className="text-sm text-bad">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-sm bg-accent px-3 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-muted">
          Demo accounts: teacher / teacher123, student1 / student123
        </p>
      </div>
    </main>
  );
}
