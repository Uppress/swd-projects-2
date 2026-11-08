import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteProjectForm from "@/app/components/delete-project-form";
import NewTaskForm from "@/app/components/new-task-form";
import TaskControls from "@/app/components/task-controls";
import { getProject, getTasks } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const projectId = Number(idParam);

  if (!Number.isSafeInteger(projectId) || projectId < 1) notFound();

  const [project, tasks] = await Promise.all([getProject(projectId), getTasks(projectId)]);
  if (!project) notFound();

  const doneCount = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

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
              <p className="mt-1 text-xs text-[var(--muted)]">{doneCount} of {tasks.length} tasks complete</p>
            </div>
            <DeleteProjectForm projectId={project.id} />
          </div>
        </section>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-labelledby="tasks-heading">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h2 id="tasks-heading" className="text-sm font-semibold">Tasks</h2>
              <span className="text-xs text-[var(--muted)]">{tasks.length} total</span>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 px-5 py-12 text-center">
                <p className="display-type text-2xl">Nothing on the list yet</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Add a task to get this project moving.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {tasks.map((task) => (
                  <li key={task.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className={`font-semibold ${task.status === "done" ? "text-[var(--muted)] line-through" : ""}`}>
                        {task.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                        <span className="capitalize">{task.priority} priority</span>
                        {task.dueDate && <span>Due {task.dueDate}</span>}
                      </div>
                    </div>
                    <TaskControls task={task} projectId={project.id} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <NewTaskForm projectId={project.id} />
        </div>
      </div>
    </main>
  );
}