"use client";

import { useActionState } from "react";
import { createStudentAction } from "./actions";

const inputClass =
  "mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

export function NewStudentForm() {
  const [state, formAction, pending] = useActionState(createStudentAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-ink">
          Display name
        </label>
        <input id="displayName" name="displayName" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-ink">
          Username
        </label>
        <input id="username" name="username" required className={inputClass} />
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
          minLength={6}
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-3 sm:col-span-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create student account"}
        </button>
        {state?.error && <p className="text-sm text-bad">{state.error}</p>}
        {state?.success && <p className="text-sm text-good">{state.success}</p>}
      </div>
    </form>
  );
}
