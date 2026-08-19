/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    Zod schemas for request validation. Shared by every API route.
 */
import { z } from "zod";
import { TASK_STATUSES } from "@/types";

export const projectInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be at most 120 characters"),
  description: z.string().trim().max(2000, "Description is too long").default(""),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #6366f1")
    .default("#6366f1"),
});

export const projectPatchSchema = projectInputSchema.partial();

export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().trim().max(4000, "Description is too long").default(""),
  status: z.enum(TASK_STATUSES).default("backlog"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const taskPatchSchema = taskInputSchema.partial();

export const taskMoveSchema = z.object({
  status: z.enum(TASK_STATUSES, {
    errorMap: () => ({ message: "Status must be one of: backlog, in-progress, review, done" }),
  }),
});

export const taskOrderSchema = z.object({
  order: z.number().int().min(0, "Order must be a non-negative integer"),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
