"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask } from "@/app/actions";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = { ok: false, errors: {} };

export default function NewTaskForm({ projectId }: { projectId: number }) {
  const [state, formAction, pending] = useActionState(createTask, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
      <input type="hidden" name="project_id" value={projectId} />
      <h2 className="display-type text-2xl">New task</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="task-title" className="mb-1.5 block text-xs font-semibold">Task title</label>
          <input
            id="task-title"
            name="title"
            required
            maxLength={140}
            aria-describedby={state.errors.title ? "task-title-error" : undefined}
            aria-invalid={Boolean(state.errors.title)}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green)]/15"
            placeholder="What needs to get done?"
          />
          {state.errors.title && <p id="task-title-error" className="mt-1 text-xs text-red-700">{state.errors.title}</p>}
        </div>
        <div>
          <label htmlFor="task-status" className="mb-1.5 block text-xs font-semibold">Status</label>
          <select id="task-status" name="status" defaultValue="todo" className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm">
            <option value="todo">To do</option>
            <option value="doing">In progress</option>
            <option value="done">Done</option>
          </select>
          {state.errors.status && <p className="mt-1 text-xs text-red-700">{state.errors.status}</p>}
        </div>
        <div>
          <label htmlFor="task-priority" className="mb-1.5 block text-xs font-semibold">Priority</label>
          <select id="task-priority" name="priority" defaultValue="medium" className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {state.errors.priority && <p className="mt-1 text-xs text-red-700">{state.errors.priority}</p>}
        </div>
        <div>
          <label htmlFor="task-due-date" className="mb-1.5 block text-xs font-semibold">Due date</label>
          <input id="task-due-date" name="due_date" type="date" className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm" />
          {state.errors.due_date && <p className="mt-1 text-xs text-red-700">{state.errors.due_date}</p>}
        </div>
      </div>
      {state.errors.form && <p role="alert" className="mt-3 text-sm text-red-700">{state.errors.form}</p>}
      {state.ok && <p role="status" className="mt-3 text-sm text-[var(--green)]">Task created.</p>}
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={pending} className="rounded-lg bg-[var(--green)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#195a47] disabled:cursor-wait disabled:opacity-60">
          {pending ? "Adding..." : "Add task"}
        </button>
      </div>
    </form>
  );
}