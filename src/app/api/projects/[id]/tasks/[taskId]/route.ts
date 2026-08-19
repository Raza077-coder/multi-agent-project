/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    Task item routes:
 *               PATCH  /api/projects/:id/tasks/:taskId -> update task
 *               DELETE /api/projects/:id/tasks/:taskId -> delete task
 */
import { getStore } from "@/lib/db";
import { noContent, notFound, ok, parseJson, serverError, validationError } from "@/lib/api/helpers";
import { taskPatchSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type TaskParams = { params: Promise<{ id: string; taskId: string }> };

export async function PATCH(request: Request, { params }: TaskParams) {
  try {
    const { id, taskId } = await params;
    const body = await parseJson(request);
    const parsed = taskPatchSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const task = await getStore().updateTask(id, taskId, parsed.data);
    if (!task) return notFound("Task not found");
    return ok(task);
  } catch (error) {
    console.error("[tasks] PATCH failed:", error);
    return serverError();
  }
}

export async function DELETE(_request: Request, { params }: TaskParams) {
  try {
    const { id, taskId } = await params;
    const deleted = await getStore().deleteTask(id, taskId);
    if (!deleted) return notFound("Task not found");
    return noContent();
  } catch (error) {
    console.error("[tasks] DELETE failed:", error);
    return serverError();
  }
}
