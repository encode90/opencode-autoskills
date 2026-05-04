import { tool } from "@opencode-ai/plugin";
import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { checkNodeVersion } from "./version.js";
const SKILLS_DIR = path.join(".agents", "skills");

function normalizeSkillName(value: string) {
  return value.trim().toLowerCase();
}

async function runAutoskills(cwd: string, args: string[]) {
  try {
    const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(`npx autoskills ${args.join(" ")}`.trim(), {
        cwd,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      }, (error, stdout, stderr) => {
        if (error) {
          reject(Object.assign(error, { stdout, stderr }));
          return;
        }

        resolve({ stdout, stderr });
      });
    });

    return {
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stdout = typeof error === "object" && error && "stdout" in error
      ? String(error.stdout ?? "").trim()
      : "";
    const stderr = typeof error === "object" && error && "stderr" in error
      ? String(error.stderr ?? "").trim()
      : "";

    throw new Error(
      [
        `autoskills failed: ${message}`,
        stdout && `stdout:\n${stdout}`,
        stderr && `stderr:\n${stderr}`,
      ].filter(Boolean).join("\n\n")
    );
  }
}

async function listInstalledSkills(cwd: string) {
  const root = path.join(cwd, SKILLS_DIR);

  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function removeUnselectedSkills(cwd: string, keep: string[]) {
  if (keep.length === 0) return [];

  const installed = await listInstalledSkills(cwd);
  const keepSet = new Set(keep.map(normalizeSkillName));
  const removed: string[] = [];

  for (const skill of installed) {
    if (keepSet.has(normalizeSkillName(skill))) continue;
    await fs.rm(path.join(cwd, SKILLS_DIR, skill), { recursive: true, force: true });
    removed.push(skill);
  }

  return removed;
}

export const autoskillsTool = tool({
  description:
    "Execute autoskills for real. Use action 'detect' to run a dry-run and show suggested skills, " +
    "then use action 'install' with the exact keep list selected by the user.",
  args: {
    action: tool.schema.string().describe("Action to perform: detect or install"),
    keep: tool.schema.string().array().optional().describe(
      "Exact skill directory names to keep after installation when action is install"
    ),
  },
  execute: async (args, context) => {
    if (!checkNodeVersion()) {
      return (
        "Error: Node.js >= 22.6.0 is required to use autoskills.\n" +
        "Please upgrade your Node.js version and try again."
      );
    }

    const cwd = context.directory;
    const action = normalizeSkillName(args.action || "detect");

    if (action === "detect") {
      const result = await runAutoskills(cwd, ["--dry-run"]);
      const installed = await listInstalledSkills(cwd);

      return [
        `autoskills detect completed in: ${cwd}`,
        installed.length > 0
          ? `Currently installed skills: ${installed.join(", ")}`
          : "Currently installed skills: none",
        result.stdout ? `Dry-run output:\n${result.stdout}` : "Dry-run output: (empty)",
        result.stderr ? `stderr:\n${result.stderr}` : "",
        "Ask the user which skills to keep, then call this tool again with action 'install' and the keep list.",
      ].filter(Boolean).join("\n\n");
    }

    if (action === "install") {
      const result = await runAutoskills(cwd, ["-y"]);
      const keep = (args.keep ?? []).map((entry) => entry.trim()).filter(Boolean);
      const removed = await removeUnselectedSkills(cwd, keep);
      const remaining = await listInstalledSkills(cwd);

      return [
        `autoskills install completed in: ${cwd}`,
        result.stdout ? `Install output:\n${result.stdout}` : "Install output: (empty)",
        result.stderr ? `stderr:\n${result.stderr}` : "",
        keep.length > 0
          ? `Requested keep list: ${keep.join(", ")}`
          : "Requested keep list: none (all installed skills were kept)",
        removed.length > 0
          ? `Removed unselected skills: ${removed.join(", ")}`
          : "Removed unselected skills: none",
        remaining.length > 0
          ? `Remaining installed skills: ${remaining.join(", ")}`
          : "Remaining installed skills: none",
      ].filter(Boolean).join("\n\n");
    }

    return "Error: invalid action. Use 'detect' or 'install'.";
  },
});
