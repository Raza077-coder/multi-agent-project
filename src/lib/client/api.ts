/**
 * Created by: frontend-developer-agent
 * Role:       Frontend Developer
 * Purpose:    Typed API client for the TaskFlow REST API.
 */
import type { Project, ProjectStats, Task, TaskStatus } from "@/types";

const BASE = "/api";

interface ProjectWithStats extends Project {
  stats: ProjectStats;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      body && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return body.data as T;
}

export const api = {
  health: () => request<{ status: string; storageMode: string }>("/health"),

  listProjects: () => request<ProjectWithStats[]>("/projects"),
  getProject: (id: string) =>
    request<Project & { tasks: Task[] }>(`/projects/${id}`),
  createProject: (input: {
    name: string;
    description?: string;
    color?: string;
  }) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateProject: (id: string, patch: Partial<Project>) =>
    request<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: "DELETE" }),

  listTasks: (projectId: string) =>
    request<Task[]>(`/projects/${projectId}/tasks`),
  createTask: (
    projectId: string,
    input: { title: string; description?: string; status?: TaskStatus; priority?: string }
  ) =>
    request<Task>(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateTask: (projectId: string, taskId: string, patch: Partial<Task>) =>
    request<Task>(`/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteTask: (projectId: string, taskId: string) =>
    request<void>(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" }),
  moveTask: (projectId: string, taskId: string, status: TaskStatus) =>
    request<Task>(`/projects/${projectId}/tasks/${taskId}/move`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
};
