"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import {
  ProjectIdInput,
  ProjectInput,
  TaskIdInput,
  TaskInput,
  TaskStatusInput,
  type ActionState,
} from "@/lib/validation";
import type { ZodError } from "zod";

function errorsFromZod(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((errors, issue) => {
    const field = issue.path.join(".") || "form";
    errors[field] ??= issue.message;
    return errors;
  }, {});
}

function failure(message: string): ActionState {
  return { ok: false, errors: { form: message } };
}

export async function createProject(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ProjectInput.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { ok: false, errors: errorsFromZod(parsed.error) };
  }

  try {
    await sql`
      INSERT INTO projects (name, description, color)
      VALUES (${parsed.data.name}, ${parsed.data.description}, ${parsed.data.color})
    `;
    revalidatePath("/");
    return { ok: true, errors: {} };
  } catch {
    return failure("Could not create the project. Please try again.");
  }
}

export async function createTask(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = TaskInput.safeParse({
    project_id: formData.get("project_id"),
    title: formData.get("title"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date"),
  });

  if (!parsed.success) {
    return { ok: false, errors: errorsFromZod(parsed.error) };
  }

  try {
    const rows = await sql`
      INSERT INTO tasks (project_id, title, status, priority, due_date)
      SELECT ${parsed.data.project_id}, ${parsed.data.title}, ${parsed.data.status}, ${parsed.data.priority}, ${parsed.data.due_date}::date
      WHERE EXISTS (SELECT 1 FROM projects WHERE id = ${parsed.data.project_id})
      RETURNING id
    `;

    if (rows.length === 0) {
      return failure("That project no longer exists.");
    }

    revalidatePath("/");
    revalidatePath(`/projects/${parsed.data.project_id}`);
    return { ok: true, errors: {} };
  } catch {
    return failure("Could not create the task. Please try again.");
  }
}

export async function updateTaskStatus(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = TaskStatusInput.safeParse({
    project_id: formData.get("project_id"),
    task_id: formData.get("task_id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, errors: errorsFromZod(parsed.error) };
  }

  try {
    const rows = await sql`
      UPDATE tasks
      SET status = ${parsed.data.status}
      WHERE id = ${parsed.data.task_id} AND project_id = ${parsed.data.project_id}
      RETURNING id
    `;

    if (rows.length === 0) {
      return failure("Task not found in this project.");
    }

    revalidatePath("/");
    revalidatePath(`/projects/${parsed.data.project_id}`);
    return { ok: true, errors: {} };
  } catch {
    return failure("Could not update the task. Please try again.");
  }
}

export async function deleteTask(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = TaskIdInput.safeParse({
    project_id: formData.get("project_id"),
    task_id: formData.get("task_id"),
  });

  if (!parsed.success) {
    return { ok: false, errors: errorsFromZod(parsed.error) };
  }

  try {
    const rows = await sql`
      DELETE FROM tasks
      WHERE id = ${parsed.data.task_id} AND project_id = ${parsed.data.project_id}
      RETURNING id
    `;

    if (rows.length === 0) {
      return failure("Task not found in this project.");
    }

    revalidatePath("/");
    revalidatePath(`/projects/${parsed.data.project_id}`);
    return { ok: true, errors: {} };
  } catch {
    return failure("Could not delete the task. Please try again.");
  }
}

export async function deleteProject(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ProjectIdInput.safeParse({ project_id: formData.get("project_id") });

  if (!parsed.success) {
    return { ok: false, errors: errorsFromZod(parsed.error) };
  }

  try {
    const rows = await sql`
      DELETE FROM projects
      WHERE id = ${parsed.data.project_id}
      RETURNING id
    `;

    if (rows.length === 0) {
      return failure("Project not found.");
    }

    revalidatePath("/");
    revalidatePath(`/projects/${parsed.data.project_id}`);
    return { ok: true, errors: {} };
  } catch {
    return failure("Could not delete the project. Please try again.");
  }
}