import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { setup, main, resolveTargetPath } from "../src/cli.js";

vi.mock("node:fs");
vi.mock("node:os");

describe("setup CLI", () => {
  let originalVersion: PropertyDescriptor | undefined;
  let originalCwd: typeof process.cwd;
  let originalExitCode: number | undefined;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalVersion = Object.getOwnPropertyDescriptor(process, "version");
    originalCwd = process.cwd;
    originalExitCode = process.exitCode;
    process.exitCode = undefined;

    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    Object.defineProperty(process, "version", { value: "v22.6.0" });
    process.cwd = vi.fn().mockReturnValue("/projects/my-app");
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    vi.mocked(fs.readFileSync).mockImplementation(() => "");
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
  });

  afterEach(() => {
    if (originalVersion) {
      Object.defineProperty(process, "version", originalVersion);
    }
    process.cwd = originalCwd;
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  it("creates global command file by default", async () => {
    await setup();
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join("/home/user/.config/opencode/commands"),
      { recursive: true }
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join("/home/user/.config/opencode/commands/autoskills.md"),
      expect.stringContaining("autoskills"),
      "utf-8"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Created: ${path.join("/home/user/.config/opencode/commands/autoskills.md")}`
    );
  });

  it("creates local command file with --local", async () => {
    await setup({ local: true });
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join("/projects/my-app/.opencode/commands"),
      { recursive: true }
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join("/projects/my-app/.opencode/commands/autoskills.md"),
      expect.stringContaining("autoskills"),
      "utf-8"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Created: ${path.join("/projects/my-app/.opencode/commands/autoskills.md")}`
    );
  });

  it("creates missing directories recursively", async () => {
    await setup();
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.any(String),
      { recursive: true }
    );
  });

  it("skips when file exists with identical content", async () => {
    const expectedContent = `---
description: Detect and install AI skills for this project
---
Run \`npx autoskills\` in the current project directory using the bash tool.

Do not inspect project files yourself. Do not parse or summarize project files. Let autoskills handle technology detection, interactive skill selection, and installation. After it finishes, briefly tell the user that installed skills are available from \`.agents/skills/\`, which OpenCode discovers automatically.`;
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      return typeof p === "string" && p.endsWith("autoskills.md");
    });
    vi.mocked(fs.readFileSync).mockReturnValue(expectedContent);

    await setup();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Skipped")
    );
  });

  it("overwrites when file exists with different content", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      return typeof p === "string" && p.endsWith("autoskills.md");
    });
    vi.mocked(fs.readFileSync).mockReturnValue("old content");

    await setup();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it("rejects old Node version and does not create files", async () => {
    Object.defineProperty(process, "version", { value: "v20.11.0" });
    await setup();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error: Node.js >= 22.6.0 is required to run setup."
    );
    expect(process.exitCode).toBe(1);
  });

  it("reports failure on write error", async () => {
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error("disk full");
    });
    await setup();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("disk full")
    );
    expect(process.exitCode).toBe(1);
  });
});

describe("setup CLI path traversal prevention", () => {
  let originalCwd: typeof process.cwd;

  beforeEach(() => {
    originalCwd = process.cwd;
    process.cwd = vi.fn().mockReturnValue("/projects/my-app");
    vi.mocked(os.homedir).mockReturnValue("/home/user");
  });

  afterEach(() => {
    process.cwd = originalCwd;
    vi.restoreAllMocks();
  });

  it("throws when filename escapes the base directory", () => {
    expect(() => resolveTargetPath(true, "../../etc/passwd")).toThrow(
      "Path traversal detected"
    );
  });

  it("does not throw for normal filenames", () => {
    expect(() => resolveTargetPath(true, "autoskills.md")).not.toThrow();
    expect(() => resolveTargetPath(false, "autoskills.md")).not.toThrow();
  });
});

describe("main CLI", () => {
  let originalArgv: string[];
  let originalExitCode: number | undefined;
  let originalCwd: typeof process.cwd;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalArgv = process.argv;
    originalExitCode = process.exitCode;
    originalCwd = process.cwd;
    process.exitCode = undefined;
    process.cwd = vi.fn().mockReturnValue("/projects/my-app");
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    Object.defineProperty(process, "version", { value: "v22.6.0" });
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exitCode = originalExitCode;
    process.cwd = originalCwd;
    vi.restoreAllMocks();
  });

  it("runs setup when 'setup' subcommand is provided", async () => {
    process.argv = ["node", "cli.js", "setup"];
    await main();
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it("shows usage and exits with code 1 when no subcommand is given", async () => {
    process.argv = ["node", "cli.js"];
    await main();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Usage: opencode-autoskills setup [--local]"
    );
    expect(process.exitCode).toBe(1);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("shows usage and exits with code 1 for unknown subcommand", async () => {
    process.argv = ["node", "cli.js", "help"];
    await main();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Usage: opencode-autoskills setup [--local]"
    );
    expect(process.exitCode).toBe(1);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("passes --local flag through to setup", async () => {
    process.argv = ["node", "cli.js", "setup", "--local"];
    await main();
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join("/projects/my-app/.opencode/commands"),
      { recursive: true }
    );
    expect(process.exitCode).toBeUndefined();
  });
});
