/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    Seed dataset used by the JSON store on first run so the app
 *             demos well out of the box.
 */
import { type Database, type Project, type Task } from "@/types";

const NOW = new Date().toISOString();

const projects: Project[] = [
  {
    id: "prj_seed_web",
    name: "Website Redesign",
    description: "Refresh the public marketing site with a modern design system.",
    color: "#6366f1",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prj_seed_mobile",
    name: "Mobile App v2",
    description: "Ship the next major release of the mobile application.",
    color: "#ec4899",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prj_seed_api",
    name: "API Platform",
    description: "Stabilize and document the public REST API.",
    color: "#10b981",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

function task(
  id: string,
  projectId: string,
  title: string,
  description: string,
  status: Task["status"],
  priority: Task["priority"],
  order: number
): Task {
  return { id, projectId, title, description, status, priority, order, createdAt: NOW, updatedAt: NOW };
}

const tasks: Task[] = [
  task("tsk_seed_1", "prj_seed_web", "Design new hero section", "Create a bold hero with product screenshots.", "done", "high", 0),
  task("tsk_seed_2", "prj_seed_web", "Migrate to Tailwind v4", "Upgrade all components to the new utility classes.", "in-progress", "high", 1),
  task("tsk_seed_3", "prj_seed_web", "Write case-study pages", "Publish three customer success stories.", "review", "medium", 2),
  task("tsk_seed_4", "prj_seed_web", "Add pricing page", "Design and build the pricing comparison table.", "backlog", "medium", 3),
  task("tsk_seed_5", "prj_seed_mobile", "Offline mode", "Cache project boards for offline viewing.", "in-progress", "high", 0),
  task("tsk_seed_6", "prj_seed_mobile", "Push notifications", "Notify users when a task is assigned to them.", "backlog", "medium", 1),
  task("tsk_seed_7", "prj_seed_mobile", "Fix navigation flicker", "Stabilize the tab navigator animations.", "done", "low", 2),
  task("tsk_seed_8", "prj_seed_api", "Rate limiting", "Add token-bucket rate limiting to public endpoints.", "review", "high", 0),
  task("tsk_seed_9", "prj_seed_api", "OpenAPI spec", "Generate and publish an OpenAPI 3.0 specification.", "backlog", "medium", 1),
];

export function seedDatabase(): Database {
  return {
    projects: JSON.parse(JSON.stringify(projects)) as Project[],
    tasks: JSON.parse(JSON.stringify(tasks)) as Task[],
  };
}
