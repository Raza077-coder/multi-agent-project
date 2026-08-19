/**
 * Created by: qa-testing-agent
 * Role:       QA / Testing Engineer
 * Purpose:    API smoke test — exercises the full CRUD lifecycle against a
 *             running TaskFlow server.
 * Usage:      node scripts/smoke.mjs [BASE_URL]   (default http://localhost:3000)
 */
const BASE = process.argv[2] ?? "http://localhost:3000";

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ✔ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✘ ${label} ${detail}`);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  const body = await response.json().catch(() => null);
  return { response, body };
}

async function main() {
  console.log(`\nTaskFlow smoke test → ${BASE}\n`);

  // 1. Health
  const health = await request("/api/health");
  check("GET /api/health returns ok", health.response.status === 200 && health.body.status === "ok", JSON.stringify(health.body));

  // 2. Projects list (seeded)
  const list = await request("/api/projects");
  check("GET /api/projects returns array", Array.isArray(list.body?.data), JSON.stringify(list.body));

  // 3. Create project
  const created = await request("/api/projects", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Test Project",
      description: "created by smoke script",
      color: "#ef4444",
    }),
  });
  check("POST /api/projects creates", created.response.status === 201 && created.body?.data?.id, JSON.stringify(created.body));
  const projectId = created.body?.data?.id;

  // 4. Validation rejects bad input
  const bad = await request("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name: "" }),
  });
  check("POST rejects empty name (400)", bad.response.status === 400 && Array.isArray(bad.body?.issues), JSON.stringify(bad.body));

  // 5. Create task
  const task = await request(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title: "Smoke task", priority: "high", status: "backlog" }),
  });
  check("POST task creates", task.response.status === 201 && task.body?.data?.id, JSON.stringify(task.body));
  const taskId = task.body?.data?.id;

  // 6. Move task
  const moved = await request(`/api/projects/${projectId}/tasks/${taskId}/move`, {
    method: "POST",
    body: JSON.stringify({ status: "in-progress" }),
  });
  check("POST move updates status", moved.body?.data?.status === "in-progress", JSON.stringify(moved.body));

  // 7. Update task
  const updated = await request(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ title: "Smoke task (edited)" }),
  });
  check("PATCH task updates title", updated.body?.data?.title === "Smoke task (edited)", JSON.stringify(updated.body));

  // 8. Project detail includes tasks
  const detail = await request(`/api/projects/${projectId}`);
  check("GET project includes tasks", Array.isArray(detail.body?.data?.tasks), JSON.stringify(detail.body));

  // 9. Delete task
  const delTask = await request(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
  check("DELETE task -> 204", delTask.response.status === 204, String(delTask.response.status));

  // 10. Delete project
  const delProject = await request(`/api/projects/${projectId}`, { method: "DELETE" });
  check("DELETE project -> 204", delProject.response.status === 204, String(delProject.response.status));

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("Smoke test crashed:", error);
  process.exit(1);
});
