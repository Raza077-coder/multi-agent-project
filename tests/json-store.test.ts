/**
 * Created by: qa-testing-agent
 * Role:       QA / Testing Engineer
 * Purpose:    Unit tests for the JSON-file store adapter (in-memory variant).
 */
import { describe, expect, it } from "vitest";
import os from "node:os";
import path from "node:path";
import { JsonFileStore } from "@/lib/db/json-store";
import { completionRate } from "@/types";

let storeCounter = 0;

/** File-backed store on a unique temp path: isolated per test and seeded. */
function freshStore() {
  storeCounter += 1;
  const filePath = path.join(
    os.tmpdir(),
    `taskflow-test-${process.pid}-${Date.now()}-${storeCounter}.json`
  );
  return new JsonFileStore(filePath);
}

describe("JsonFileStore", () => {
  it("seeds data on first read", async () => {
    const store = freshStore();
    const db = await store.read();
    expect(db.projects.length).toBeGreaterThan(0);
    expect(db.tasks.length).toBeGreaterThan(0);
  });

  it("creates and lists a project", async () => {
    const store = freshStore();
    const project = await store.createProject({
      name: "Test Project",
      description: "desc",
      color: "#123456",
    });
    expect(project.id).toMatch(/^prj_/);
    const projects = await store.listProjects();
    expect(projects.some((p) => p.id === project.id)).toBe(true);
  });

  it("does not allow creating a task in a missing project", async () => {
    const store = freshStore();
    const task = await store.createTask("missing", {
      title: "x",
      description: "",
      status: "backlog",
      priority: "medium",
    });
    expect(task).toBeNull();
  });

  it("creates tasks with sequential order per column", async () => {
    const store = freshStore();
    const project = await store.createProject({
      name: "P",
      description: "",
      color: "#000000",
    });
    const a = await store.createTask(project.id, {
      title: "A",
      description: "",
      status: "backlog",
      priority: "low",
    });
    const b = await store.createTask(project.id, {
      title: "B",
      description: "",
      status: "backlog",
      priority: "low",
    });
    expect(a?.order).toBe(0);
    expect(b?.order).toBe(1);
  });

  it("moves a task between statuses and re-orders it", async () => {
    const store = freshStore();
    const project = await store.createProject({
      name: "P",
      description: "",
      color: "#000000",
    });
    const task = await store.createTask(project.id, {
      title: "Move me",
      description: "",
      status: "backlog",
      priority: "medium",
    });
    const moved = await store.moveTask(project.id, task!.id, "done");
    expect(moved?.status).toBe("done");
    // Seed data already has a "done" task, so the moved task appends at order 1.
    expect(moved?.order).toBe(1);
  });

  it("updates and deletes tasks", async () => {
    const store = freshStore();
    const project = await store.createProject({
      name: "P",
      description: "",
      color: "#000000",
    });
    const task = await store.createTask(project.id, {
      title: "Original",
      description: "",
      status: "backlog",
      priority: "medium",
    });
    const updated = await store.updateTask(project.id, task!.id, { title: "Changed" });
    expect(updated?.title).toBe("Changed");
    expect(await store.deleteTask(project.id, task!.id)).toBe(true);
    expect(await store.getTask(project.id, task!.id)).toBeNull();
  });

  it("deleting a project cascades its tasks", async () => {
    const store = freshStore();
    const project = await store.createProject({
      name: "P",
      description: "",
      color: "#000000",
    });
    await store.createTask(project.id, {
      title: "Cascade me",
      description: "",
      status: "backlog",
      priority: "low",
    });
    await store.deleteProject(project.id);
    const tasks = await store.listTasks(project.id);
    expect(tasks).toHaveLength(0);
  });
});

describe("completionRate", () => {
  it("computes rounded percentages", () => {
    expect(completionRate(1, 4)).toBe(25);
    expect(completionRate(0, 0)).toBe(0);
    expect(completionRate(3, 9)).toBe(33);
  });
});
