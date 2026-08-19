/**
 * Created by: qa-testing-agent
 * Role:       QA / Testing Engineer
 * Purpose:    Unit tests for Zod validation schemas.
 */
import { describe, expect, it } from "vitest";
import {
  projectInputSchema,
  projectPatchSchema,
  taskInputSchema,
  taskMoveSchema,
  taskOrderSchema,
} from "@/lib/validation/schemas";

describe("projectInputSchema", () => {
  it("accepts a minimal valid project", () => {
    const result = projectInputSchema.safeParse({ name: "Website Redesign" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
      expect(result.data.color).toBe("#6366f1");
    }
  });

  it("rejects empty names", () => {
    const result = projectInputSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects invalid colors", () => {
    const result = projectInputSchema.safeParse({
      name: "OK",
      color: "red",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from names", () => {
    const result = projectInputSchema.safeParse({ name: "  Mobile App  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Mobile App");
  });
});

describe("projectPatchSchema", () => {
  it("allows partial updates", () => {
    const result = projectPatchSchema.safeParse({ description: "Only this" });
    expect(result.success).toBe(true);
  });
});

describe("taskInputSchema", () => {
  it("applies defaults for status and priority", () => {
    const result = taskInputSchema.safeParse({ title: "Do the thing" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("backlog");
      expect(result.data.priority).toBe("medium");
      expect(result.data.description).toBe("");
    }
  });

  it("rejects invalid statuses", () => {
    const result = taskInputSchema.safeParse({
      title: "x",
      status: "shipped",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing titles", () => {
    const result = taskInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("taskMoveSchema", () => {
  it("accepts a valid status", () => {
    expect(taskMoveSchema.safeParse({ status: "done" }).success).toBe(true);
  });

  it("rejects garbage statuses", () => {
    expect(taskMoveSchema.safeParse({ status: "nope" }).success).toBe(false);
  });
});

describe("taskOrderSchema", () => {
  it("accepts non-negative integers", () => {
    expect(taskOrderSchema.safeParse({ order: 3 }).success).toBe(true);
  });

  it("rejects negative orders", () => {
    expect(taskOrderSchema.safeParse({ order: -1 }).success).toBe(false);
  });
});
