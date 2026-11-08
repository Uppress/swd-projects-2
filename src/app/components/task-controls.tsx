"use client";

import { useActionState } from "react";
import { deleteTask, updateTaskStatus } from "@/app/actions";
import type { Task, TaskStatus } from "@/lib/queries";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = { ok: false, errors: {} };

export default function TaskControls({ task, projectId }: { task: Task; projectId: number }) {
  const [statusState, statusAction, statusPending] = useActionState(updateTaskStatus, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteTask, initialState);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={statusAction} className="flex items-center gap-2">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="task_id" value={task.id} />
        <label className="sr-only" htmlFor={`status-${task.id}`}>Status for {task.title}</label>
        <select id={`status-${task.id}`} name="status" defaultValue={task.status} className="rounded-lg border border-[var(--line)] bg-white px-2.5 py-2 text-xs">
          <option value="todo">To do</option>
          <option value="doing">In progress</option>
          <option value="done">Done</option>
        </select>
        <button type="submit" disabled={statusPending} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold hover:bg-[var(--green-soft)] disabled:opacity-60">
          {statusPending ? "Saving..." : "Save"}
        </button>
      </form>
      <form action={deleteAction}>
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="task_id" value={task.id} />
        <button type="submit" disabled={deletePending} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
          {deletePending ? "Deleting..." : "Delete"}
        </button>
      </form>
      {(statusState.errors.form || deleteState.errors.form) && (
        <p role="alert" className="w-full text-xs text-red-700">{statusState.errors.form || deleteState.errors.form}</p>
      )}
      {statusState.ok && <span role="status" className="text-xs text-[var(--green)]">Updated</span>}
      {deleteState.ok && <span role="status" className="text-xs text-[var(--green)]">Deleted</span>}
    </div>
  );
}