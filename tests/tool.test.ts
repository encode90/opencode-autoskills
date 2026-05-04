import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import { autoskillsTool } from "../src/tool.js";

vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: {},
  readdir: vi.fn(),
  rm: vi.fn(),
}));

describe("autoskillsTool", () => {
  let originalVersion: PropertyDescriptor | undefined;
  const context = { directory: "/projects/demo" } as Parameters<typeof autoskillsTool.execute>[1];

  beforeEach(() => {
    originalVersion = Object.getOwnPropertyDescriptor(process, "version");
    vi.mocked(exec).mockReset();
    vi.mocked(fs.readdir).mockReset();
    vi.mocked(fs.rm).mockReset();
  });

  afterEach(() => {
    if (originalVersion) {
      Object.defineProperty(process, "version", originalVersion);
    }
  });

  it("runs dry-run detection on valid Node >= 22.6.0", async () => {
    Object.defineProperty(process, "version", { value: "v22.6.0" });
    vi.mocked(exec).mockImplementation((_command, _options, callback) => {
      callback?.(null, "Detected skills", "");
      return {} as never;
    });
    vi.mocked(fs.readdir).mockRejectedValue(Object.assign(new Error("missing"), { code: "ENOENT" }));

    const result = await autoskillsTool.execute({ action: "detect" }, context);

    expect(exec).toHaveBeenCalledWith(
      "npx autoskills --dry-run",
      expect.objectContaining({ cwd: "/projects/demo" }),
      expect.any(Function)
    );
    expect(result).toContain("Detected skills");
    expect(result).not.toContain("Error");
  });

  it("runs install and removes unselected skills", async () => {
    Object.defineProperty(process, "version", { value: "v23.0.0" });
    vi.mocked(exec).mockImplementation((_command, _options, callback) => {
      callback?.(null, "Installed skills", "");
      return {} as never;
    });
    vi.mocked(fs.readdir)
      .mockResolvedValueOnce([
        { isDirectory: () => true, name: "react" },
        { isDirectory: () => true, name: "go" },
      ] as never)
      .mockResolvedValueOnce([
        { isDirectory: () => true, name: "react" },
      ] as never);

    const result = await autoskillsTool.execute({ action: "install", keep: ["react"] }, context);

    expect(exec).toHaveBeenCalledWith(
      "npx autoskills -y",
      expect.objectContaining({ cwd: "/projects/demo" }),
      expect.any(Function)
    );
    expect(fs.rm).toHaveBeenCalledWith(
      expect.stringContaining(".agents"),
      { recursive: true, force: true }
    );
    expect(result).toContain("Remaining installed skills: react");
  });

  it("returns error on old Node < 22.6.0", async () => {
    Object.defineProperty(process, "version", { value: "v20.11.0" });
    const result = await autoskillsTool.execute({ action: "detect" }, context);
    expect(result).toContain("Error");
    expect(result).toContain("Node.js >= 22.6.0");
    expect(result).not.toContain("npx autoskills");
  });

  it("returns error on Node 22.5.x", async () => {
    Object.defineProperty(process, "version", { value: "v22.5.9" });
    const result = await autoskillsTool.execute({ action: "detect" }, context);
    expect(result).toContain("Error");
    expect(result).toContain("Node.js >= 22.6.0");
  });

  it("returns invalid action error for unsupported operations", async () => {
    Object.defineProperty(process, "version", { value: "v22.6.0" });
    const result = await autoskillsTool.execute({ action: "unknown" }, context);
    expect(typeof result).toBe("string");
    expect(result).toContain("invalid action");
  });

  it("has correct description and args schema", () => {
    expect(autoskillsTool.description).toContain("autoskills");
    expect(autoskillsTool.description.length).toBeGreaterThan(10);
    expect(autoskillsTool.args).toHaveProperty("action");
    expect(autoskillsTool.args).toHaveProperty("keep");
  });
});
