import "server-only";
import { sql } from "./db";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type ProjectSummary = {
  id: number;
  name: string;
  description: string;
  color: string;
  createdAt: string | Date;
  taskCount: number;
  doneCount: number;
};

export type Task = {
  id: number;
  projectId: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string | Date;
};

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
};

type ProjectRow = Omit<ProjectSummary, "taskCount" | "doneCount"> & {
  taskCount: number | string;
  doneCount: number | string;
};

function normalizeProjectCounts(rows: ProjectRow[]): ProjectSummary[] {
  return rows.map((project) => ({
    ...project,
    taskCount: Number(project.taskCount),
    doneCount: Number(project.doneCount),
  }));
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const rows = await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.color,
      p.created_at AS "createdAt",
      COUNT(t.id) FILTER (WHERE t.id IS NOT NULL) AS "taskCount",
      COUNT(t.id) FILTER (WHERE t.status = 'done') AS "doneCount"
    FROM projects AS p
    LEFT JOIN tasks AS t ON t.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC, p.id DESC
  `;

  return normalizeProjectCounts(rows as ProjectRow[]);
}

export async function getProject(id: number): Promise<ProjectSummary | null> {
  const rows = await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.color,
      p.created_at AS "createdAt",
      COUNT(t.id) FILTER (WHERE t.id IS NOT NULL) AS "taskCount",
      COUNT(t.id) FILTER (WHERE t.status = 'done') AS "doneCount"
    FROM projects AS p
    LEFT JOIN tasks AS t ON t.project_id = p.id
    WHERE p.id = ${id}
    GROUP BY p.id
    LIMIT 1
  `;

  const [project] = normalizeProjectCounts(rows as ProjectRow[]);
  return project ?? null;
}

export async function getTasks(
  projectId: number,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const status = filters.status ?? null;
  const priority = filters.priority ?? null;
  const search = filters.search?.trim() || null;

  const rows = await sql`
    SELECT
      t.id,
      t.project_id AS "projectId",
      t.title,
      t.status,
      t.priority,
      t.due_date::text AS "dueDate",
      t.created_at AS "createdAt"
    FROM tasks AS t
    WHERE t.project_id = ${projectId}
      AND (${status}::text IS NULL OR t.status = ${status})
      AND (${priority}::text IS NULL OR t.priority = ${priority})
      AND (${search}::text IS NULL OR t.title ILIKE '%' || ${search} || '%')
    ORDER BY
      CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC
  `;

  return rows as Task[];
}