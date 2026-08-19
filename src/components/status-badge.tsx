/**
 * Created by: frontend-developer-agent
 * Role:       Frontend Developer
 * Purpose:    Small colored badge showing a task status.
 */
import type { TaskStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/client/format";

const STATUS_STYLES: Record<TaskStatus, string> = {
  backlog: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  "in-progress": "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  done: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
