/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    Pluggable persistence contract. Any adapter (JSON file,
 *             PostgreSQL, etc.) implements this interface.
 */
import type { Database, Project, Task, TaskStatus } from "@/types";

export interface DataStore {
  /** Read a full snapshot of the database. */
  read(): Promise<Database>;
  /** Persist a full snapshot of the database. */
  write(db: Database): Promise<void>;
}

export interface ProjectStore extends DataStore {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(input: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project>;
  updateProject(id: string, patch: Partial<Project>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;

  listTasks(projectId: string): Promise<Task[]>;
  getTask(projectId: string, taskId: string): Promise<Task | null>;
  createTask(
    projectId: string,
    input: Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt" | "order">
  ): Promise<Task | null>;
  updateTask(
    projectId: string,
    taskId: string,
    patch: Partial<Task>
  ): Promise<Task | null>;
  deleteTask(projectId: string, taskId: string): Promise<boolean>;
  /** Move a task to a new status, appending it at the end of that column. */
  moveTask(projectId: string, taskId: string, status: TaskStatus): Promise<Task | null>;
  /** Set a task's sort order within its status column. */
  setTaskOrder(projectId: string, taskId: string, order: number): Promise<Task | null>;
}
