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

export type ProjectProgress = {
  id: number;
  name: string;
  color: string;
  taskCount: number;
  doneCount: number;
};

export type OverdueTask = {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  priority: TaskPriority;
  dueDate: string;
};

export type TrackerStats = {
  projectCount: number;
  taskCount: number;
  doneCount: number;
  overdueCount: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  projects: ProjectProgress[];
  overdueTasks: OverdueTask[];
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

type StatsAggregateRow = {
  status_grouped: number | string;
  priority_grouped: number | string;
  status: TaskStatus | null;
  priority: TaskPriority | null;
  task_count: number | string;
  done_count: number | string;
  overdue_count: number | string;
  project_count: number | string;
};

type StatsDetailsRow = {
  projects: ProjectProgress[] | string;
  overdueTasks: OverdueTask[] | string;
};

function parseJsonArray<T>(value: T[] | string): T[] {
  return typeof value === "string" ? JSON.parse(value) as T[] : value;
}

export async function getTrackerStats(): Promise<TrackerStats> {
  const [aggregateRows, detailsRows] = await Promise.all([
    sql`
      SELECT
        GROUPING(t.status) AS status_grouped,
        GROUPING(t.priority) AS priority_grouped,
        t.status,
        t.priority,
        COUNT(t.id) AS task_count,
        COUNT(t.id) FILTER (WHERE t.status = 'done') AS done_count,
        COUNT(t.id) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status <> 'done') AS overdue_count,
        (SELECT COUNT(*) FROM projects) AS project_count
      FROM (SELECT 1) AS seed
      LEFT JOIN tasks AS t ON TRUE
      GROUP BY GROUPING SETS ((t.status), (t.priority), ())
    `,
    sql`
      WITH project_progress AS (
        SELECT
          p.id,
          p.name,
          p.color,
          COUNT(t.id) AS "taskCount",
          COUNT(t.id) FILTER (WHERE t.status = 'done') AS "doneCount"
        FROM projects AS p
        LEFT JOIN tasks AS t ON t.project_id = p.id
        GROUP BY p.id
      ),
      overdue_tasks AS (
        SELECT
          t.id,
          p.id AS "projectId",
          p.name AS "projectName",
          t.title,
          t.priority,
          t.due_date::text AS "dueDate"
        FROM tasks AS t
        INNER JOIN projects AS p ON p.id = t.project_id
        WHERE t.due_date < CURRENT_DATE AND t.status <> 'done'
        ORDER BY t.due_date ASC, t.id ASC
        LIMIT 20
      )
      SELECT
        COALESCE((SELECT json_agg(pp ORDER BY pp.name) FROM project_progress AS pp), '[]'::json) AS projects,
        COALESCE((SELECT json_agg(ot ORDER BY ot."dueDate", ot.id) FROM overdue_tasks AS ot), '[]'::json) AS "overdueTasks"
    `,
  ]);

  const aggregates = aggregateRows as StatsAggregateRow[];
  const total = aggregates.find((row) => Number(row.status_grouped) === 1 && Number(row.priority_grouped) === 1);
  const byStatus: Record<TaskStatus, number> = { todo: 0, doing: 0, done: 0 };
  const byPriority: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0 };

  for (const row of aggregates) {
    if (Number(row.status_grouped) === 0 && row.status) {
      byStatus[row.status] = Number(row.task_count);
    }
    if (Number(row.priority_grouped) === 0 && row.priority) {
      byPriority[row.priority] = Number(row.task_count);
    }
  }

  const [details] = detailsRows as StatsDetailsRow[];

  return {
    projectCount: Number(total?.project_count ?? 0),
    taskCount: Number(total?.task_count ?? 0),
    doneCount: Number(total?.done_count ?? 0),
    overdueCount: Number(total?.overdue_count ?? 0),
    byStatus,
    byPriority,
    projects: parseJsonArray(details?.projects ?? []),
    overdueTasks: parseJsonArray(details?.overdueTasks ?? []),
  };
}