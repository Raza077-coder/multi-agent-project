/**
 * Created by: frontend-developer-agent
 * Role:       Frontend Developer
 * Purpose:    Kanban board page — four status columns, task cards,
 *             drag-free status moves via buttons + full CRUD modals.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { formatDate, PRIORITY_COLORS } from "@/lib/client/format";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/types";
import { StatusBadge } from "@/components/status-badge";
import { TaskModal } from "@/components/task-modal";

const COLUMN_DOT: Record<TaskStatus, string> = {
  backlog: "bg-slate-400",
  "in-progress": "bg-indigo-400",
  review: "bg-amber-400",
  done: "bg-emerald-400",
};

export default function ProjectBoardPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<{ name: string; color: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<TaskStatus>("backlog");

  const load = useCallback(async () => {
    try {
      const [projectData, taskData] = await Promise.all([
        api.getProject(projectId),
        api.listTasks(projectId),
      ]);
      setProject({ name: projectData.name, color: projectData.color });
      setTasks(taskData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleMove(task: Task, status: TaskStatus) {
    try {
      const updated = await api.moveTask(projectId, task.id, status);
      setTasks((prev) =>
        prev
          .map((t) => (t.id === updated.id ? updated : t))
          .sort((a, b) => a.order - b.order)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task");
    }
  }

  async function handleDelete(taskId: string) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.deleteTask(projectId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  async function handleCreate(input: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: string;
  }) {
    await api.createTask(projectId, input);
    setModalOpen(false);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-xs font-medium text-slate-500 transition hover:text-slate-300"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white">
            <span
              className="h-4 w-4 rounded-md"
              style={{ backgroundColor: project?.color ?? "#6366f1" }}
            />
            {project?.name ?? "Loading…"}
          </h1>
        </div>
        <button
          onClick={() => {
            setModalStatus("backlog");
            setModalOpen(true);
          }}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
        >
          + New task
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-4">
          {TASK_STATUSES.map((status) => {
            const columnTasks = tasks
              .filter((t) => t.status === status)
              .sort((a, b) => a.order - b.order);
            return (
              <div
                key={status}
                className="flex min-h-[300px] flex-col rounded-2xl border border-slate-800 bg-slate-900/60"
              >
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${COLUMN_DOT[status]}`} />
                    <span className="text-sm font-semibold capitalize text-slate-200">
                      {status.replace("-", " ")}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setModalStatus(status);
                      setModalOpen(true);
                    }}
                    aria-label={`Add task to ${status}`}
                    className="grid h-6 w-6 place-items-center rounded-md text-slate-500 transition hover:bg-slate-800 hover:text-white"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-3">
                  {columnTasks.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-600">
                      No tasks here
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group rounded-xl border border-slate-800 bg-slate-900 p-3.5 shadow-sm transition hover:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-snug text-slate-100">
                            {task.title}
                          </p>
                          <span
                            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRIORITY_COLORS[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-600">
                            {formatDate(task.createdAt)}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                            <button
                              onClick={() => handleDelete(task.id)}
                              aria-label="Delete task"
                              className="rounded-md px-1.5 py-0.5 text-xs text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 border-t border-slate-800 pt-2.5">
                          <div className="flex gap-1">
                            {TASK_STATUSES.filter((s) => s !== task.status).map((s) => (
                              <button
                                key={s}
                                onClick={() => void handleMove(task, s)}
                                className="flex-1 rounded-md bg-slate-800/80 px-1.5 py-1 text-[10px] font-medium text-slate-400 transition hover:bg-slate-700 hover:text-white"
                              >
                                → {s.replace("-", " ")}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <StatusBadge status={task.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        projectId={projectId}
        initialStatus={modalStatus}
        onSubmit={handleCreate}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
