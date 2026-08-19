/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    Task collection routes scoped to a project:
 *               GET  /api/projects/:id/tasks -> list tasks
 *               POST /api/projects/:id/tasks -> create task
 *             (Task item routes live in [taskId]/route.ts)
 */
import { getStore } from "@/lib/db";
import { created, notFound, ok, parseJson, serverError, validationError } from "@/lib/api/helpers";
import { taskInputSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type ProjectParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: ProjectParams) {
  try {
    const { id } = await params;
    const store = getStore();
    if (!(await store.getProject(id))) return notFound("Project not found");
    const tasks = await store.listTasks(id);
    return ok(tasks);
  } catch (error) {
    console.error("[tasks] GET failed:", error);
    return serverError();
  }
}

export async function POST(request: Request, { params }: ProjectParams) {
  try {
    const { id } = await params;
    const body = await parseJson(request);
    const parsed = taskInputSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const task = await getStore().createTask(id, parsed.data);
    if (!task) return notFound("Project not found");
    return created(task);
  } catch (error) {
    console.error("[tasks] POST failed:", error);
    return serverError();
  }
}
