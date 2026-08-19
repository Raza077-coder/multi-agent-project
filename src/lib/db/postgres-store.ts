/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    PostgreSQL persistence adapter (production). Uses the `pg`
 *             driver with parameterized queries and lazy connection setup.
 *             Schema is created automatically on first use (CREATE TABLE IF NOT EXISTS).
 */
import { Pool, type PoolConfig } from "pg";
import {
  type Database,
  type Project,
  type Task,
  type TaskStatus,
  emptyDatabase,
  newId,
  nowIso,
} from "@/types";
import type { ProjectStore } from "./types";

export class PostgresStore implements ProjectStore {
  private pool: Pool | null = null;
  private readonly config: PoolConfig;

  constructor(connectionString: string) {
    this.config = { connectionString, max: 5 };
  }

  private async getPool(): Promise<Pool> {
    if (!this.pool) {
      this.pool = new Pool(this.config);
      await this.pool.query(SCHEMA_SQL);
    }
    return this.pool;
  }

  async read(): Promise<Database> {
    const pool = await this.getPool();
    const [projects, tasks] = await Promise.all([
      pool.query<Project>("SELECT * FROM projects ORDER BY \"createdAt\" ASC"),
      pool.query<Task>("SELECT * FROM tasks ORDER BY \"order\" ASC"),
    ]);
    return { projects: projects.rows, tasks: tasks.rows };
  }

  async write(_db: Database): Promise<void> {
    // The Postgres adapter is transactional per-operation; a full-snapshot
    // write is intentionally a no-op (use the granular methods instead).
  }

  async listProjects(): Promise<Project[]> {
    const pool = await this.getPool();
    const result = await pool.query<Project>(
      'SELECT * FROM projects ORDER BY "createdAt" ASC'
    );
    return result.rows;
  }

  async getProject(id: string): Promise<Project | null> {
    const pool = await this.getPool();
    const result = await pool.query<Project>(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  }

  async createProject(
    input: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    const pool = await this.getPool();
    const ts = nowIso();
    const id = newId("prj");
    await pool.query(
      `INSERT INTO projects (id, name, description, color, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, input.name, input.description, input.color, ts, ts]
    );
    return { ...input, id, createdAt: ts, updatedAt: ts };
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
    const pool = await this.getPool();
    const current = await this.getProject(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: nowIso() };
    await pool.query(
      `UPDATE projects SET name = $1, description = $2, color = $3, "updatedAt" = $4 WHERE id = $5`,
      [next.name, next.description, next.color, next.updatedAt, id]
    );
    return next;
  }

  async deleteProject(id: string): Promise<boolean> {
    const pool = await this.getPool();
    await pool.query("DELETE FROM tasks WHERE \"projectId\" = $1", [id]);
    const result = await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async listTasks(projectId: string): Promise<Task[]> {
    const pool = await this.getPool();
    const result = await pool.query<Task>(
      'SELECT * FROM tasks WHERE "projectId" = $1 ORDER BY "order" ASC',
      [projectId]
    );
    return result.rows;
  }

  async getTask(projectId: string, taskId: string): Promise<Task | null> {
    const pool = await this.getPool();
    const result = await pool.query<Task>(
      'SELECT * FROM tasks WHERE id = $1 AND "projectId" = $2',
      [taskId, projectId]
    );
    return result.rows[0] ?? null;
  }

  async createTask(
    projectId: string,
    input: Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt" | "order">
  ): Promise<Task | null> {
    const pool = await this.getPool();
    const project = await this.getProject(projectId);
    if (!project) return null;
    const orderResult = await pool.query<{ max: number | null }>(
      'SELECT MAX("order") as max FROM tasks WHERE "projectId" = $1 AND status = $2',
      [projectId, input.status]
    );
    const order = (orderResult.rows[0]?.max ?? -1) + 1;
    const ts = nowIso();
    const id = newId("tsk");
    await pool.query(
      `INSERT INTO tasks (id, "projectId", title, description, status, priority, "order", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, projectId, input.title, input.description, input.status, input.priority, order, ts, ts]
    );
    return { ...input, id, projectId, order, createdAt: ts, updatedAt: ts };
  }

  async updateTask(
    projectId: string,
    taskId: string,
    patch: Partial<Task>
  ): Promise<Task | null> {
    const pool = await this.getPool();
    const current = await this.getTask(projectId, taskId);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: nowIso() };
    await pool.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, "order" = $5, "updatedAt" = $6
       WHERE id = $7 AND "projectId" = $8`,
      [next.title, next.description, next.status, next.priority, next.order, next.updatedAt, taskId, projectId]
    );
    return next;
  }

  async deleteTask(projectId: string, taskId: string): Promise<boolean> {
    const pool = await this.getPool();
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND "projectId" = $2',
      [taskId, projectId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async moveTask(projectId: string, taskId: string, status: TaskStatus): Promise<Task | null> {
    const pool = await this.getPool();
    const task = await this.getTask(projectId, taskId);
    if (!task) return null;
    if (task.status === status) return task;
    const orderResult = await pool.query<{ max: number | null }>(
      'SELECT MAX("order") as max FROM tasks WHERE "projectId" = $1 AND status = $2',
      [projectId, status]
    );
    const order = (orderResult.rows[0]?.max ?? -1) + 1;
    const updated = { ...task, status, order, updatedAt: nowIso() };
    await pool.query(
      'UPDATE tasks SET status = $1, "order" = $2, "updatedAt" = $3 WHERE id = $4 AND "projectId" = $5',
      [status, order, updated.updatedAt, taskId, projectId]
    );
    return updated;
  }

  async setTaskOrder(projectId: string, taskId: string, order: number): Promise<Task | null> {
    const pool = await this.getPool();
    const task = await this.getTask(projectId, taskId);
    if (!task) return null;
    const updated = { ...task, order, updatedAt: nowIso() };
    await pool.query(
      'UPDATE tasks SET "order" = $1, "updatedAt" = $2 WHERE id = $3 AND "projectId" = $4',
      [order, updated.updatedAt, taskId, projectId]
    );
    return updated;
  }
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#6366f1',
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('backlog', 'in-progress', 'review', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks("projectId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
`;
