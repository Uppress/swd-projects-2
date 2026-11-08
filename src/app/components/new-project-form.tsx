"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProject } from "@/app/actions";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = { ok: false, errors: {} };

export default function NewProjectForm() {
  const [state, formAction, pending] = useActionState(createProject, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-[var(--line)] bg-white/70 p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="display-type text-2xl">New project</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Give the next piece of work a home.</p>
        </div>
        <span className="mt-2 size-3 rounded-full bg-[var(--sun)]" aria-hidden="true" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project-name" className="mb-1.5 block text-xs font-semibold">Project name</label>
          <input
            id="project-name"
            name="name"
            required
            maxLength={80}
            aria-describedby={state.errors.name ? "project-name-error" : undefined}
            aria-invalid={Boolean(state.errors.name)}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green)]/15"
            placeholder="e.g. Website refresh"
          />
          {state.errors.name && <p id="project-name-error" className="mt-1 text-xs text-red-700">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor="project-color" className="mb-1.5 block text-xs font-semibold">Project color</label>
          <input
            id="project-color"
            name="color"
            type="color"
            defaultValue="#23745d"
            className="h-10 w-full cursor-pointer rounded-lg border border-[var(--line)] bg-white p-1"
          />
          {state.errors.color && <p className="mt-1 text-xs text-red-700">{state.errors.color}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="project-description" className="mb-1.5 block text-xs font-semibold">Description</label>
          <textarea
            id="project-description"
            name="description"
            rows={2}
            maxLength={1000}
            aria-describedby={state.errors.description ? "project-description-error" : undefined}
            aria-invalid={Boolean(state.errors.description)}
            className="w-full resize-y rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green)]/15"
            placeholder="What is this project about?"
          />
          {state.errors.description && <p id="project-description-error" className="mt-1 text-xs text-red-700">{state.errors.description}</p>}
        </div>
      </div>

      {state.errors.form && <p role="alert" className="mt-3 text-sm text-red-700">{state.errors.form}</p>}
      {state.ok && <p role="status" className="mt-3 text-sm text-[var(--green)]">Project created.</p>}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--green)] disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create project"}
        </button>
      </div>
    </form>
  );
}