<!--
  Created by: documentation-agent
  Role:       Technical Writer
-->
# TaskFlow — REST API Reference

Base URL: `/api` (same origin as the app).

All request/response bodies are JSON. Success responses use the envelope
`{ "data": ... }`.

---

## Health

### `GET /api/health`

Returns service status and the active storage mode.

```json
{ "status": "ok", "service": "taskflow", "storageMode": "json", "timestamp": "2026-08-18T12:00:00.000Z" }
```

---

## Projects

### `GET /api/projects`

Lists all projects with per-project stats:

```json
{
  "data": [
    {
      "id": "prj_seed_web",
      "name": "Website Redesign",
      "description": "Refresh the public marketing site.",
      "color": "#6366f1",
      "createdAt": "2026-08-18T12:00:00.000Z",
      "updatedAt": "2026-08-18T12:00:00.000Z",
      "stats": { "totalTasks": 4, "doneTasks": 1, "completionRate": 25 }
    }
  ]
}
```

### `POST /api/projects`

Create a project.

```json
{ "name": "Mobile App v2", "description": "…", "color": "#ec4899" }
```

- `name` (required, 1–120 chars) · `description` (optional) · `color` (optional hex)
- Returns `201` with the created project.

### `GET /api/projects/:id`

Returns the project **with its full task list**:

```json
{ "data": { "id": "…", "name": "…", "color": "…", "tasks": [ … ] } }
```

### `PATCH /api/projects/:id`

Partial update — any subset of `name`, `description`, `color`.

### `DELETE /api/projects/:id`

Deletes the project and all its tasks. Returns `204`.

---

## Tasks

### `GET /api/projects/:id/tasks`

Lists tasks for a project, ordered by `order` ascending.

### `POST /api/projects/:id/tasks`

Create a task:

```json
{ "title": "Implement offline mode", "description": "…", "status": "backlog", "priority": "high" }
```

- `status` defaults to `backlog`, `priority` to `medium`.
- The task is appended to its status column (`order` = max + 1).
- Returns `201`. Returns `404` if the project does not exist.

### `PATCH /api/projects/:id/tasks/:taskId`

Partial update of a task (`title`, `description`, `status`, `priority`).

### `DELETE /api/projects/:id/tasks/:taskId`

Deletes a task. Returns `204`.

### `POST /api/projects/:id/tasks/:taskId/move`

Moves a task to another status column (Kanban drag & drop):

```json
{ "status": "in-progress" }
```

The task is appended to the target column. Returns the updated task.

---

## Validation

Invalid input returns `400` with structured issues:

```json
{
  "error": "Validation failed",
  "issues": [{ "path": "name", "message": "Name is required" }]
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Validation failed (see `issues`) |
| 404 | Project or task not found |
| 500 | Unexpected server error |

## Example: Full Lifecycle (curl)

```bash
# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo","color":"#10b981"}'

# Add a task
curl -X POST http://localhost:3000/api/projects/<id>/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ship it","status":"backlog","priority":"high"}'

# Move it to done
curl -X POST http://localhost:3000/api/projects/<id>/tasks/<taskId>/move \
  -H 'Content-Type: application/json' \
  -d '{"status":"done"}'

# Delete the project (cascades tasks)
curl -X DELETE http://localhost:3000/api/projects/<id>
```
