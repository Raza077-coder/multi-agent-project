/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    POST /api/projects/:id/tasks/:taskId/move
 *             Moves a task to a new status column (Kanban drag & drop).
 *             Body: { "status": "in-progress" }
 */
import { getStore } from "@/lib/db";
import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api/helpers";
import { taskMoveSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type MoveParams = { params: Promise<{ id: string; taskId: string }> };

export async function POST(request: Request, { params }: MoveParams) {
  try {
    const { id, taskId } = await params;
    const body = await parseJson(request);
    const parsed = taskMoveSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const task = await getStore().moveTask(id, taskId, parsed.data.status);
    if (!task) return notFound("Task not found");
    return ok(task);
  } catch (error) {
    console.error("[tasks] move failed:", error);
    return serverError();
  }
}
