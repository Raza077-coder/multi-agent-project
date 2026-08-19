/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    Dynamic project routes: GET / PATCH / DELETE /api/projects/:id
 */
import { getStore } from "@/lib/db";
import { noContent, notFound, ok, parseJson, serverError, validationError } from "@/lib/api/helpers";
import { projectPatchSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const store = getStore();
    const project = await store.getProject(id);
    if (!project) return notFound("Project not found");
    const tasks = await store.listTasks(id);
    return ok({ ...project, tasks });
  } catch (error) {
    console.error("[projects/:id] GET failed:", error);
    return serverError();
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJson(request);
    const parsed = projectPatchSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const project = await getStore().updateProject(id, parsed.data);
    if (!project) return notFound("Project not found");
    return ok(project);
  } catch (error) {
    console.error("[projects/:id] PATCH failed:", error);
    return serverError();
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await getStore().deleteProject(id);
    if (!deleted) return notFound("Project not found");
    return noContent();
  } catch (error) {
    console.error("[projects/:id] DELETE failed:", error);
    return serverError();
  }
}
