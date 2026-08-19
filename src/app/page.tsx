/**
 * Created by: frontend-developer-agent
 * Role:       Frontend Developer
 * Purpose:    Dashboard page — stats overview, projects grid, create flow.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { formatDate } from "@/lib/client/format";
import type { Project, ProjectStats } from "@/types";
import { ProjectModal } from "@/components/project-modal";

interface ProjectWithStats extends Project {
  stats: ProjectStats;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.listProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = projects.reduce(
    (acc, project) => ({
      projects: acc.projects + 1,
      tasks: acc.tasks + project.stats.totalTasks,
      done: acc.done + project.stats.doneTasks,
    }),
    { projects: 0, tasks: 0, done: 0 }
  );
  const completionRate =
    totals.tasks === 0 ? 0 : Math.round((totals.done / totals.tasks) * 100);

  async function handleCreate(input: {
    name: string;
    description: string;
    color: string;
  }) {
    await api.createProject(input);
    setModalOpen(false);
    await load();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            All projects, at a glance.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
        >
          + New project
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Projects" value={String(totals.projects)} accent="text-indigo-400" />
        <StatCard label="Total tasks" value={String(totals.tasks)} accent="text-fuchsia-400" />
        <StatCard label="Completed" value={String(totals.done)} accent="text-emerald-400" />
        <StatCard label="Completion" value={`${completionRate}%`} accent="text-amber-400" />
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-300">No projects yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first project to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl hover:shadow-black/30"
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: project.color }}
              />
              <div className="flex items-start justify-between gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-base font-bold text-white"
                  style={{ backgroundColor: project.color }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </span>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                  {project.stats.totalTasks} tasks
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-white group-hover:text-indigo-300">
                {project.name}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                {project.description || "No description"}
              </p>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>{project.stats.completionRate}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${project.stats.completionRate}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-600">
                Updated {formatDate(project.updatedAt)}
              </p>
            </a>
          ))}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        onSubmit={handleCreate}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}
