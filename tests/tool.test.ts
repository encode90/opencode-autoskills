import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { autoskillsTool } from "../src/tool.js";

describe("autoskillsTool", () => {
  let originalVersion: PropertyDescriptor | undefined;
  const context = {} as Parameters<typeof autoskillsTool.execute>[1];

  beforeEach(() => {
    originalVersion = Object.getOwnPropertyDescriptor(process, "version");
  });

  afterEach(() => {
    if (originalVersion) {
      Object.defineProperty(process, "version", originalVersion);
    }
  });

  it("returns bash instruction on valid Node >= 22.6.0", async () => {
    Object.defineProperty(process, "version", { value: "v22.6.0" });
    const result = await autoskillsTool.execute({}, context);
    expect(result).toContain("npx autoskills");
    expect(result).not.toContain("-y");
    expect(result).not.toContain("Error");
  });

  it("returns bash instruction on newer Node", async () => {
    Object.defineProperty(process, "version", { value: "v23.0.0" });
    const result = await autoskillsTool.execute({}, context);
    expect(result).toContain("npx autoskills");
  });

  it("returns error on old Node < 22.6.0", async () => {
    Object.defineProperty(process, "version", { value: "v20.11.0" });
    const result = await autoskillsTool.execute({}, context);
    expect(result).toContain("Error");
    expect(result).toContain("Node.js >= 22.6.0");
    expect(result).not.toContain("npx autoskills");
  });

  it("returns error on Node 22.5.x", async () => {
    Object.defineProperty(process, "version", { value: "v22.5.9" });
    const result = await autoskillsTool.execute({}, context);
    expect(result).toContain("Error");
    expect(result).toContain("Node.js >= 22.6.0");
  });

  it("never spawns a child process — returns text only", async () => {
    Object.defineProperty(process, "version", { value: "v22.6.0" });
    const result = await autoskillsTool.execute({}, context);
    expect(typeof result).toBe("string");
    // Verify no spawn-related properties exist on the result
    expect(result).not.toHaveProperty("pid");
    expect(result).not.toHaveProperty("stdout");
    expect(result).not.toHaveProperty("stderr");
  });

  it("has correct description and empty args schema", () => {
    expect(autoskillsTool.description).toContain("autoskills");
    expect(autoskillsTool.description.length).toBeGreaterThan(10);
    expect(autoskillsTool.args).toEqual({});
  });
});
