"use client";

import { useActionState } from "react";
import { MODES, MODE_LABEL, parseModes } from "@/lib/modes";

type ScenarioFormAction = (
  prevState: { error?: string } | undefined,
  formData: FormData
) => Promise<{ error?: string } | undefined>;

const inputClass =
  "mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

export function ScenarioForm({
  action,
  initial,
  submitLabel,
}: {
  action: ScenarioFormAction;
  initial?: {
    category: string;
    title: string;
    description: string;
    difficulty: string;
    is_active: number;
    available_modes: string;
    pass_score: number;
    excellent_score: number;
    max_errors: number | null;
    time_limit_s: number | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const initialModes = initial ? parseModes(initial.available_modes) : MODES;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink">
            Category
          </label>
          <input
            id="category"
            name="category"
            required
            defaultValue={initial?.category}
            placeholder="e.g. Vascular Access"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-ink">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={initial?.title}
            placeholder="e.g. Central Venous Catheterization (CVC)"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-ink">
            Difficulty
          </label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={initial?.difficulty ?? "medium"}
            className={inputClass}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={initial ? initial.is_active === 1 : true}
            className="h-4 w-4 rounded-sm border-line bg-bg accent-accent"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-ink">
            Visible to students
          </label>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-ink">Available modes</span>
        <div className="mt-2 flex flex-wrap gap-4">
          {MODES.map((mode) => (
            <label key={mode} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="availableModes"
                value={mode}
                defaultChecked={initialModes.includes(mode)}
                className="h-4 w-4 rounded-sm border-line bg-bg accent-accent"
              />
              {MODE_LABEL[mode]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-ink">Grading — score bands</span>
        <p className="mt-1 text-xs text-muted">
          A completed attempt is graded Fail below the pass score, Pass at or above it, and
          Excellent at or above the excellent score.
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="passScore" className="block text-sm font-medium text-ink">
              Pass score
            </label>
            <input
              id="passScore"
              name="passScore"
              type="number"
              min={0}
              max={100}
              required
              defaultValue={initial?.pass_score ?? 70}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="excellentScore" className="block text-sm font-medium text-ink">
              Excellent score
            </label>
            <input
              id="excellentScore"
              name="excellentScore"
              type="number"
              min={0}
              max={100}
              required
              defaultValue={initial?.excellent_score ?? 90}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-ink">
          Grading — critical-error caps (optional)
        </span>
        <p className="mt-1 text-xs text-muted">
          Exceeding either cap fails the attempt regardless of score. Leave blank for no cap.
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="maxErrors" className="block text-sm font-medium text-ink">
              Max errors
            </label>
            <input
              id="maxErrors"
              name="maxErrors"
              type="number"
              min={0}
              defaultValue={initial?.max_errors ?? ""}
              placeholder="No cap"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="timeLimitS" className="block text-sm font-medium text-ink">
              Time limit (seconds)
            </label>
            <input
              id="timeLimitS"
              name="timeLimitS"
              type="number"
              min={0}
              defaultValue={initial?.time_limit_s ?? ""}
              placeholder="No limit"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {state?.error && <p className="text-sm text-bad">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
