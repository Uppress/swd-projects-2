import Link from "next/link";
import { getTrackerStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

const statusNames = { todo: "To do", doing: "Doing", done: "Done" } as const;
const priorityNames = { low: "Low", medium: "Medium", high: "High" } as const;

function BarRow({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const width = max === 0 ? 0 : Math.round((count / max) * 100);

  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_2rem] items-center gap-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#e8eee8]">
        <div className="h-full rounded-full transition-[width]" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
      <span className="text-right text-sm font-semibold tabular-nums">{count}</span>
    </div>
  );
}

export default async function StatsPage() {
  const stats = await getTrackerStats();
  const statusMax = Math.max(...Object.values(stats.byStatus));
  const priorityMax = Math.max(...Object.values(stats.byPriority));
  const completion = stats.taskCount === 0 ? 0 : Math.round((stats.doneCount / stats.taskCount) * 100);

  return (
    <main className="min-h-screen px-5 pb-16 pt-6 sm:px-8 sm:pt-9">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-5">
          <Link href="/" className="flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--green)]">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--ink)] text-sm font-bold text-white">F</span>
            <span className="text-sm font-semibold tracking-wide">FIELDNOTES</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-[var(--green)] hover:underline">All projects</Link>
        </header>

        <section className="flex flex-col gap-3 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-14">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--green)]">Workspace pulse</p>
            <h1 className="display-type text-4xl leading-tight sm:text-5xl">Statistics</h1>
          </div>
          <p className="text-sm text-[var(--muted)]">Overall completion <span className="ml-1 font-semibold text-[var(--ink)]">{completion}%</span></p>
        </section>

        <section aria-label="Overall totals" className="grid grid-cols-2 border-y border-[var(--line)] sm:grid-cols-4">
          {[
            { label: "Projects", value: stats.projectCount },
            { label: "Tasks", value: stats.taskCount },
            { label: "Complete", value: stats.doneCount },
            { label: "Overdue", value: stats.overdueCount },
          ].map((metric, index) => (
            <div key={metric.label} className={`py-5 ${index % 2 === 1 ? "pl-5 sm:pl-7" : ""} ${index > 1 ? "border-t border-[var(--line)] sm:border-t-0" : ""} ${index !== 0 ? "sm:border-l sm:border-[var(--line)] sm:pl-7" : ""}`}>
              <p className={`text-3xl font-semibold tabular-nums ${metric.label === "Overdue" && metric.value > 0 ? "text-red-700" : ""}`}>{metric.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-[var(--muted)]">{metric.label}</p>
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="status-heading">
            <h2 id="status-heading" className="mb-5 text-sm font-semibold">Tasks by status</h2>
            <div className="space-y-4">
              {(Object.keys(statusNames) as (keyof typeof statusNames)[]).map((status) => (
                <BarRow key={status} label={statusNames[status]} count={stats.byStatus[status]} max={statusMax} color={status === "done" ? "#23745d" : status === "doing" ? "#d2a72f" : "#8b9b91"} />
              ))}
            </div>
          </section>
          <section aria-labelledby="priority-heading">
            <h2 id="priority-heading" className="mb-5 text-sm font-semibold">Tasks by priority</h2>
            <div className="space-y-4">
              {(Object.keys(priorityNames) as (keyof typeof priorityNames)[]).map((priority) => (
                <BarRow key={priority} label={priorityNames[priority]} count={stats.byPriority[priority]} max={priorityMax} color={priority === "high" ? "#bd5844" : priority === "medium" ? "#d2a72f" : "#5c9470"} />
              ))}
            </div>
          </section>
        </div>

        <section aria-labelledby="project-progress-heading" className="mt-12">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h2 id="project-progress-heading" className="text-sm font-semibold">Completion by project</h2>
            <span className="text-xs text-[var(--muted)]">{stats.projects.length} projects</span>
          </div>
          {stats.projects.length === 0 ? (
            <p className="py-8 text-sm text-[var(--muted)]">No projects to report yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {stats.projects.map((project) => {
                const percent = project.taskCount === 0 ? 0 : Math.round((project.doneCount / project.taskCount) * 100);

                return (
                  <li key={project.id} className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,2fr)_4rem]">
                    <Link href={`/projects/${project.id}`} className="flex min-w-0 items-center gap-3 font-medium hover:text-[var(--green)]">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} aria-hidden="true" />
                      <span className="truncate">{project.name}</span>
                      <span className="sr-only">{project.doneCount} of {project.taskCount} tasks complete</span>
                    </Link>
                    <div className="hidden h-2 overflow-hidden rounded-full bg-[#e8eee8] sm:block" role="progressbar" aria-label={`${project.name} completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                      <div className="h-full rounded-full bg-[var(--green)]" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-right text-sm font-semibold tabular-nums">{percent}%</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="overdue-heading" className="mt-12">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h2 id="overdue-heading" className="text-sm font-semibold">Overdue tasks</h2>
            <span className="text-xs text-red-700">{stats.overdueCount} total</span>
          </div>
          {stats.overdueTasks.length === 0 ? (
            <p className="py-8 text-sm text-[var(--muted)]">No overdue tasks. You are up to date.</p>
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {stats.overdueTasks.map((task) => (
                <li key={task.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/projects/${task.projectId}`} className="font-medium hover:text-[var(--green)]">{task.title}</Link>
                  <div className="flex flex-wrap gap-x-3 text-xs text-[var(--muted)]">
                    <span>{task.projectName}</span>
                    <time dateTime={task.dueDate} className="font-semibold text-red-700">Due {task.dueDate}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {stats.overdueCount > stats.overdueTasks.length && (
            <p className="mt-3 text-xs text-[var(--muted)]">Showing the 20 most overdue tasks.</p>
          )}
        </section>
      </div>
    </main>
  );
}