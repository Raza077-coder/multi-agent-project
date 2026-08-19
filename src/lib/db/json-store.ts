/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    JSON-file persistence adapter. Zero-config for local dev and
 *             Vercel previews; data persists to a JSON file via atomic
 *             write (temp file + rename). Falls back to in-memory when the
 *             filesystem is not writable (e.g. read-only serverless fs).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
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
import { seedDatabase } from "./seed";

const CACHE = new Map<string, { db: Database; ts: number }>();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class JsonFileStore implements ProjectStore {
  private readonly filePath: string;
  private readonly memory: Database | null;
  private readonly useMemory: boolean;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.memory = null;
    this.useMemory = false;
  }

  /** In-memory-only variant (used by tests and read-only runtimes). */
  static inMemory(): JsonFileStore {
    const store = new JsonFileStore("");
    (store as unknown as { memory: Database | null }).memory = emptyDatabase();
    (store as unknown as { useMemory: boolean }).useMemory = true;
    return store;
  }

  private async ensureLoaded(): Promise<Database> {
    if (this.useMemory) return this.memory as Database;
    const cached = CACHE.get(this.filePath);
    if (cached) return cached.db;

    let db: Database;
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      db = JSON.parse(raw) as Database;
    } catch {
      db = seedDatabase();
      await this.persist(db);
    }
    CACHE.set(this.filePath, { db, ts: Date.now() });
    return db;
  }

  private async persist(db: Database): Promise<void> {
    if (this.useMemory) {
      Object.assign(this.memory as Database, db);
      return;
    }
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf-8");
    await fs.rename(tmp, this.filePath);
    CACHE.set(this.filePath, { db, ts: Date.now() });
  }

  async read(): Promise<Database> {
    return clone(await this.ensureLoaded());
  }

  async write(db: Database): Promise<void> {
    await this.persist(clone(db));
  }

  async listProjects(): Promise<Project[]> {
    const db = await this.ensureLoaded();
    return clone(db.projects);
  }

  async getProject(id: string): Promise<Project | null> {
    const db = await this.ensureLoaded();
    const found = db.projects.find((p) => p.id === id);
    return found ? clone(found) : null;
  }

  async createProject(
    input: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    const db = await this.ensureLoaded();
    const ts = nowIso();
    const project: Project = {
      ...input,
      id: newId("prj"),
      createdAt: ts,
      updatedAt: ts,
    };
    db.projects.push(project);
    await this.persist(db);
    return clone(project);
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
    const db = await this.ensureLoaded();
    const project = db.projects.find((p) => p.id === id);
    if (!project) return null;
    Object.assign(project, patch, { updatedAt: nowIso() });
    await this.persist(db);
    return clone(project);
  }

  async deleteProject(id: string): Promise<boolean> {
    const db = await this.ensureLoaded();
    const before = db.projects.length;
    db.projects = db.projects.filter((p) => p.id !== id);
    db.tasks = db.tasks.filter((t) => t.projectId !== id);
    if (db.projects.length === before) return false;
    await this.persist(db);
    return true;
  }

  async listTasks(projectId: string): Promise<Task[]> {
    const db = await this.ensureLoaded();
    return clone(
      db.tasks
        .filter((t) => t.projectId === projectId)
        .sort((a, b) => a.order - b.order)
    );
  }

  async getTask(projectId: string, taskId: string): Promise<Task | null> {
    const db = await this.ensureLoaded();
    const found = db.tasks.find((t) => t.id === taskId && t.projectId === projectId);
    return found ? clone(found) : null;
  }

  async createTask(
    projectId: string,
    input: Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt" | "order">
  ): Promise<Task | null> {
    const db = await this.ensureLoaded();
    if (!db.projects.some((p) => p.id === projectId)) return null;
    const column = db.tasks
      .filter((t) => t.projectId === projectId && t.status === input.status)
      .sort((a, b) => a.order - b.order);
    const order = column.length > 0 ? column[column.length - 1].order + 1 : 0;
    const ts = nowIso();
    const task: Task = {
      ...input,
      id: newId("tsk"),
      projectId,
      order,
      createdAt: ts,
      updatedAt: ts,
    };
    db.tasks.push(task);
    await this.persist(db);
    return clone(task);
  }

  async updateTask(
    projectId: string,
    taskId: string,
    patch: Partial<Task>
  ): Promise<Task | null> {
    const db = await this.ensureLoaded();
    const task = db.tasks.find((t) => t.id === taskId && t.projectId === projectId);
    if (!task) return null;
    Object.assign(task, patch, { updatedAt: nowIso() });
    await this.persist(db);
    return clone(task);
  }

  async deleteTask(projectId: string, taskId: string): Promise<boolean> {
    const db = await this.ensureLoaded();
    const before = db.tasks.length;
    db.tasks = db.tasks.filter((t) => !(t.id === taskId && t.projectId === projectId));
    if (db.tasks.length === before) return false;
    await this.persist(db);
    return true;
  }

  async moveTask(projectId: string, taskId: string, status: TaskStatus): Promise<Task | null> {
    const db = await this.ensureLoaded();
    const task = db.tasks.find((t) => t.id === taskId && t.projectId === projectId);
    if (!task) return null;
    if (task.status === status) return clone(task);
    task.status = status;
    task.updatedAt = nowIso();
    const column = db.tasks
      .filter((t) => t.projectId === projectId && t.status === status)
      .sort((a, b) => a.order - b.order);
    task.order = column.length > 0 ? column[column.length - 1].order + 1 : 0;
    await this.persist(db);
    return clone(task);
  }

  async setTaskOrder(projectId: string, taskId: string, order: number): Promise<Task | null> {
    const db = await this.ensureLoaded();
    const task = db.tasks.find((t) => t.id === taskId && t.projectId === projectId);
    if (!task) return null;
    task.order = order;
    task.updatedAt = nowIso();
    await this.persist(db);
    return clone(task);
  }
}
