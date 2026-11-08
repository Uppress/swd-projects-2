import { getProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getProjects();
  const taskCount = projects.reduce((total, project) => total + project.taskCount, 0);
  const doneCount = projects.reduce((total, project) => total + project.doneCount, 0);
  const completion = taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100);

  return (
    <main className="min-h-screen px-5 pb-16 pt-6 sm:px-8 sm:pt-9">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--ink)] text-sm font-bold text-white">
              F
            </div>
            <span className="text-sm font-semibold tracking-wide">FIELDNOTES</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            Workspace overview
          </span>
        </header>

        <section className="flex flex-col gap-7 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-14">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--green)]">
              Your work, in motion
            </p>
            <h1 className="display-type text-4xl leading-tight sm:text-5xl">Projects</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">
              A clear view of what is moving, what is finished, and what comes next.
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[var(--line)] rounded-xl border border-[var(--line)] bg-white/70 px-1 py-3 sm:min-w-[330px]">
            <div className="px-4">
              <p className="text-2xl font-semibold tabular-nums">{projects.length}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-[var(--muted)]">Projects</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-semibold tabular-nums">{taskCount - doneCount}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-[var(--muted)]">Open tasks</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-semibold tabular-nums">{completion}%</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-[var(--muted)]">Complete</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="project-list-heading">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h2 id="project-list-heading" className="text-sm font-semibold">All projects</h2>
            <span className="text-xs text-[var(--muted)]">{projects.length} total</span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 px-6 py-16 text-center">
              <p className="display-type text-2xl">A fresh page</p>
              <p className="mt-2 text-sm text-[var(--muted)]">There are no projects to show yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => {
                const progress = project.taskCount === 0
                  ? 0
                  : Math.round((project.doneCount / project.taskCount) * 100);

                return (
                  <article
                    key={project.id}
                    className="project-card overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] shadow-[0_8px_24px_rgba(29,49,44,0.035)]"
                  >
                    <div className="h-1.5" style={{ backgroundColor: project.color }} />
                    <div className="p-5 sm:p-6">
                      <div className="flex min-h-24 items-start justify-between gap-5">
                        <div>
                          <h3 className="display-type text-2xl leading-tight">{project.name}</h3>
                          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                            {project.description || "No description provided."}
                          </p>
                        </div>
                        <span
                          className="mt-1 size-3 shrink-0 rounded-full ring-4 ring-black/[0.035]"
                          style={{ backgroundColor: project.color }}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="mt-7 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-[var(--muted)]">Completion</p>
                          <p className="mt-1 text-sm font-semibold tabular-nums">
                            {project.doneCount} <span className="font-normal text-[var(--muted)]">/ {project.taskCount} tasks</span>
                          </p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-[var(--green)]">{progress}%</span>
                      </div>
                      <div
                        className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1ed]"
                        role="progressbar"
                        aria-label={`${project.name} completion`}
                        aria-valuemin={0}
                        aria-valuemax={project.taskCount || 1}
                        aria-valuenow={project.doneCount}
                      >
                        <div
                          className="h-full rounded-full bg-[var(--green)] transition-[width] duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}