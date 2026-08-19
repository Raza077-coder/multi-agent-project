/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    Domain model shared by the storage layer, API layer, and UI.
 */

/** Task statuses in Kanban order. */
export const TASK_STATUSES = ["backlog", "in-progress", "review", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  projects: Project[];
  tasks: Task[];
}

export interface ProjectStats {
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  completionRate: number;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  completionRate: number;
  tasksByStatus: Record<TaskStatus, number>;
  recentTasks: Task[];
}

export function emptyDatabase(): Database {
  return { projects: [], tasks: [] };
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Compute completion rate 0-100 (rounds to whole percent). */
export function completionRate(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}
