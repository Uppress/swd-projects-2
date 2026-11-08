"use client";

import { useOptimistic, useState, useTransition } from "react";
import { deleteTask, updateTaskStatus } from "@/app/actions";
import type { Task, TaskPriority, TaskStatus } from "@/lib/queries";
import type { ActionState } from "@/lib/validation";

const columns: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "To do" },
  { status: "doing", title: "Doing" },
  { status: "done", title: "Done" },
];

const priorityClasses: Record<TaskPriority, string> = {
  low: "bg-[#eaf2eb] text-[#456b50]",
  medium: "bg-[#fff4d6] text-[#80631b]",
  high: "bg-[#fbe8e4] text-[#9a4332]",
};

const initialState: ActionState = { ok: false, errors: {} };

type OptimisticChange = {
  taskId: number;
  status?: TaskStatus;
  remove?: boolean;
};

function localDateString() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dueDateLabel(dueDate: string) {
  return new Date(`${dueDate}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildTaskFormData(projectId: number, taskId: number, status?: TaskStatus) {
  const formData = new FormData();
  formData.set("project_id", String(projectId));
  formData.set("task_id", String(taskId));
  if (status) formData.set("status", status);
  return formData;
}

export default function KanbanBoard({ tasks, projectId }: { tasks: Task[]; projectId: number }) {
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (currentTasks, change: OptimisticChange) => {
      if (change.remove) return currentTasks.filter((task) => task.id !== change.taskId);
      return currentTasks.map((task) => task.id === change.taskId && change.status
        ? { ...task, status: change.status }
        : task);
    },
  );
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");

  function moveTask(taskId: number, status: TaskStatus) {
    setActionError("");
    startTransition(async () => {
      setOptimisticTasks({ taskId, status });
      const result = await updateTaskStatus(initialState, buildTaskFormData(projectId, taskId, status));
      if (!result.ok) setActionError(result.errors.form ?? "Could not move the task.");
    });
  }

  function removeTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    setActionError("");
    startTransition(async () => {
      setOptimisticTasks({ taskId: task.id, remove: true });
      const result = await deleteTask(initialState, buildTaskFormData(projectId, task.id));
      if (!result.ok) setActionError(result.errors.form ?? "Could not delete the task.");
    });
  }

  return (
    <div>
      {actionError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</p>}
      <div className="grid items-start gap-4 md:grid-cols-3">
        {columns.map((column, columnIndex) => {
          const columnTasks = optimisticTasks.filter((task) => task.status === column.status);

          return (
            <section key={column.status} aria-labelledby={`column-${column.status}`} className="min-w-0 rounded-2xl border border-[var(--line)] bg-[#eaf0e9]/70 p-3 sm:p-4">
              <header className="mb-3 flex items-center justify-between px-1">
                <h3 id={`column-${column.status}`} className="text-sm font-semibold">{column.title}</h3>
                <span className="grid min-w-7 place-items-center rounded-full bg-white px-2 py-1 text-xs font-semibold tabular-nums text-[var(--muted)]">
                  {columnTasks.length}
                </span>
              </header>

              {columnTasks.length === 0 ? (
                <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-[var(--line)] bg-white/45 px-4 py-6 text-center text-xs text-[var(--muted)]">
                  No tasks here
                </div>
              ) : (
                <ul className="space-y-3">
                  {columnTasks.map((task) => {
                    const overdue = task.status !== "done" && Boolean(task.dueDate && task.dueDate < localDateString());

                    return (
                      <li key={task.id}>
                        <article className="rounded-xl border border-[var(--line)] bg-white p-4 shadow-[0_3px_10px_rgba(29,49,44,0.035)]">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className={`min-w-0 text-sm font-semibold leading-5 ${task.status === "done" ? "text-[var(--muted)] line-through" : ""}`}>
                              {task.title}
                            </h4>
                            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${priorityClasses[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>

                          <div className="mt-3 min-h-5">
                            {task.dueDate && (
                              <time dateTime={task.dueDate} className={`text-xs ${overdue ? "font-semibold text-red-700" : "text-[var(--muted)]"}`}>
                                {overdue ? "Overdue · " : "Due "}{dueDateLabel(task.dueDate)}
                              </time>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-[var(--line)] pt-3">
                            {columnIndex > 0 && (
                              <button
                                type="button"
                                title={`Move to ${columns[columnIndex - 1].title}`}
                                aria-label={`Move ${task.title} left to ${columns[columnIndex - 1].title}`}
                                disabled={pending}
                                onClick={() => moveTask(task.id, columns[columnIndex - 1].status)}
                                className="rounded-md px-2 py-1.5 text-xs font-semibold text-[var(--green)] hover:bg-[var(--green-soft)] disabled:opacity-50"
                              >
                                &larr; Left
                              </button>
                            )}
                            {columnIndex < columns.length - 1 && (
                              <button
                                type="button"
                                title={`Move to ${columns[columnIndex + 1].title}`}
                                aria-label={`Move ${task.title} right to ${columns[columnIndex + 1].title}`}
                                disabled={pending}
                                onClick={() => moveTask(task.id, columns[columnIndex + 1].status)}
                                className="rounded-md px-2 py-1.5 text-xs font-semibold text-[var(--green)] hover:bg-[var(--green-soft)] disabled:opacity-50"
                              >
                                Right &rarr;
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => removeTask(task)}
                              className="ml-auto rounded-md px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}