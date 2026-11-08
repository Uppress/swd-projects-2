import { z } from "zod";

export const ProjectInput = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(1000).optional().default(""),
  color: z.string().trim().regex(/^#[\da-fA-F]{6}$/, "Choose a valid hex color.").default("#6366f1"),
});

export const TaskInput = z.object({
  project_id: z.coerce.number().int().positive(),
  title: z.string().trim().min(2).max(140),
  status: z.enum(["todo", "doing", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.union([z.iso.date(), z.literal("")]).optional().transform((value) => value || null),
});

export const TaskStatusInput = z.object({
  project_id: z.coerce.number().int().positive(),
  task_id: z.coerce.number().int().positive(),
  status: z.enum(["todo", "doing", "done"]),
});

export const TaskIdInput = z.object({
  project_id: z.coerce.number().int().positive(),
  task_id: z.coerce.number().int().positive(),
});

export const ProjectIdInput = z.object({
  project_id: z.coerce.number().int().positive(),
});

export type ActionState = {
  ok: boolean;
  errors: Record<string, string>;
};