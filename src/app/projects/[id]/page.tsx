import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteProjectForm from "@/app/components/delete-project-form";
import KanbanBoard from "@/app/components/kanban-board";
import NewTaskForm from "@/app/components/new-task-form";
import { getProject, getTasks, type TaskPriority } from "@/lib/queries";

export const dynamic = "force-dynamic";

const priorities = ["low", "medium", "high"] as const;

function isTaskPriority(value: string | undefined): value is TaskPriority {
  return priorities.some((priority) => priority === value);
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ priority?: string | string[]; q?: string | string[] }>;
}) {
  const [{ id: idParam }, query] = await Promise.all([params, searchParams]);
  const projectId = Number(idParam);

  if (!Number.isSafeInteger(projectId) || projectId < 1) notFound();

  const priorityParam = Array.isArray(query.priority) ? query.priority[0] : query.priority;
  const priority = isTaskPriority(priorityParam) ? priorityParam : undefined;
  const searchParam = Array.isArray(query.q) ? query.q[0] : query.q;
  const search = searchParam?.trim() ?? "";

  const [project, tasks] = await Promise.all([
    getProject(projectId),
    getTasks(projectId, { priority, search }),
  ]);
  if (!project) notFound();

  const progress = project.taskCount === 0
    ? 0
    : Math.round((project.doneCount / project.taskCount) * 100);
  const hasFilters = Boolean(priority || search);

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

        <div className="my-8 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />

        <section className="flex flex-col gap-7 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--green)]">Project details</p>
            <h1 className="display-type text-4xl leading-tight sm:text-5xl">{project.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {project.description || "No description provided."}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="min-w-28">
              <p className="text-2xl font-semibold tabular-nums">{progress}%</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{project.doneCount} of {project.taskCount} tasks complete</p>
            </div>
            <DeleteProjectForm projectId={project.id} />
          </div>
        </section>

        <div className="mt-8 space-y-6">
          <section aria-labelledby="tasks-heading">
            <div className="mb-4 flex flex-col gap-4 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="tasks-heading" className="text-sm font-semibold">Kanban board</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">{tasks.length} matching {tasks.length === 1 ? "task" : "tasks"}</p>
              </div>
              <form method="get" className="flex flex-wrap items-end gap-2">
                <div>
                  <label htmlFor="priority-filter" className="mb-1 block text-[11px] font-semibold text-[var(--muted)]">Priority</label>
                  <select id="priority-filter" name="priority" defaultValue={priority ?? ""} className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm">
                    <option value="">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="task-query" className="mb-1 block text-[11px] font-semibold text-[var(--muted)]">Title</label>
                  <input id="task-query" name="q" type="search" defaultValue={search} placeholder="Search tasks" className="h-10 w-44 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" />
                </div>
                <button type="submit" className="h-10 rounded-lg bg-[var(--ink)] px-4 text-sm font-semibold text-white hover:bg-[var(--green)]">Filter</button>
                {hasFilters && <Link href={`/projects/${projectId}`} className="px-2 py-2.5 text-sm font-medium text-[var(--green)] hover:underline">Clear</Link>}
              </form>
            </div>
            <KanbanBoard tasks={tasks} projectId={project.id} />
          </section>

          <NewTaskForm projectId={project.id} />
        </div>
      </div>
    </main>
  );
}