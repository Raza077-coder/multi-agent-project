/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    DataStore factory. Selects the persistence adapter from
 *             environment configuration:
 *               DATA_MODE=json      -> JsonFileStore (default)
 *               DATA_MODE=postgres  -> PostgresStore (requires DATABASE_URL)
 */
import path from "node:path";
import { JsonFileStore } from "./json-store";
import { PostgresStore } from "./postgres-store";
import type { ProjectStore } from "./types";

export type StorageMode = "json" | "postgres";

function resolveJsonPath(): string {
  const fromEnv = process.env.JSON_DB_PATH;
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv);
  }
  return path.resolve(process.cwd(), "data", "db.json");
}

let cachedStore: ProjectStore | null = null;

export function getStore(): ProjectStore {
  if (cachedStore) return cachedStore;

  const mode = (process.env.DATA_MODE ?? "json") as StorageMode;
  if (mode === "postgres") {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATA_MODE=postgres requires DATABASE_URL to be set. Add it to your environment."
      );
    }
    cachedStore = new PostgresStore(url);
  } else {
    cachedStore = new JsonFileStore(resolveJsonPath());
  }
  return cachedStore;
}

export function currentStorageMode(): StorageMode {
  return (process.env.DATA_MODE ?? "json") === "postgres" ? "postgres" : "json";
}

/** Test helper: reset the singleton between tests. */
export function resetStoreForTests(): void {
  cachedStore = null;
}
