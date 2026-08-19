/**
 * Created by: backend-developer-agent
 * Role:       Backend Developer
 * Purpose:    GET /api/health — liveness probe with storage mode + timestamp.
 */
import { NextResponse } from "next/server";
import { currentStorageMode, getStore } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await getStore().read();
    return NextResponse.json({
      status: "ok",
      service: "taskflow",
      storageMode: currentStorageMode(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
