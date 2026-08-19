/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    REST routes for projects:
 *               GET    /api/projects          -> list projects (+ stats)
 *               POST   /api/projects          -> create project
 *               GET    /api/projects/:id      -> project detail
 *               PATCH  /api/projects/:id      -> update project
 *               DELETE /api/projects/:id      -> delete project (cascades tasks)
 */
import { getStore } from "@/lib/db";
import { created, noContent, notFound, ok, parseJson, serverError, validationError } from "@/lib/api/helpers";
import { projectInputSchema, projectPatchSchema } from "@/lib/validation/schemas";
import { completionRate } from "@/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const store = getStore();
    const projects = await store.listProjects();
    const db = await store.read();

    if (request.url.includes("/api/projects/")) {
      return ok(projects); // handled by dynamic route below; kept for safety
    }

    const projectsWithStats = projects.map((project) => {
      const tasks = db.tasks.filter((t) => t.projectId === project.id);
      const done = tasks.filter((t) => t.status === "done").length;
      return {
        ...project,
        stats: {
          totalTasks: tasks.length,
          doneTasks: done,
          completionRate: completionRate(done, tasks.length),
        },
      };
    });

    return ok(projectsWithStats);
  } catch (error) {
    console.error("[projects] GET failed:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJson(request);
    const parsed = projectInputSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);
    const project = await getStore().createProject(parsed.data);
    return created(project);
  } catch (error) {
    console.error("[projects] POST failed:", error);
    return serverError();
  }
}
