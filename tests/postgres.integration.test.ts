/**
 * Created by: qa-testing-agent
 * Role:       QA / Testing Engineer
 * Purpose:    Integration test for the PostgreSQL adapter. Skips when
 *             DATABASE_URL is not set (e.g. local unit-test runs).
 */
import { describe, expect, it } from "vitest";
import { PostgresStore } from "@/lib/db/postgres-store";

const url = process.env.DATABASE_URL;

const describePostgres = url ? describe : describe.skip;

describePostgres("PostgresStore integration", () => {
  it("runs the full CRUD lifecycle", async () => {
    const store = new PostgresStore(url!);

    const project = await store.createProject({
      name: "PG Test",
      description: "integration",
      color: "#abcdef",
    });
    expect(project.id).toMatch(/^prj_/);

    const task = await store.createTask(project.id, {
      title: "PG task",
      description: "",
      status: "backlog",
      priority: "high",
    });
    expect(task?.order).toBe(0);

    const moved = await store.moveTask(project.id, task!.id, "in-progress");
    expect(moved?.status).toBe("in-progress");

    const listed = await store.listTasks(project.id);
    expect(listed).toHaveLength(1);

    await store.deleteProject(project.id);
    expect(await store.getProject(project.id)).toBeNull();
    expect(await store.listTasks(project.id)).toHaveLength(0);
  });
});
