import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { checkNodeVersion } from "./version.js";

const PLUGIN_NAME = "opencode-autoskills";
const COMMAND_FILE_CONTENT = `---
description: Detect and install AI skills for this project
---
Run \`npx autoskills\` in the current project directory using the bash tool.

Do not inspect project files yourself. Do not parse or summarize project files. Let autoskills handle technology detection, interactive skill selection, and installation. After it finishes, briefly tell the user that installed skills are available from \`.agents/skills/\`, which OpenCode discovers automatically.`;

export function resolveTargetPath(local: boolean, filename = "autoskills.md"): { base: string; target: string } {
  const home = os.homedir();
  const base = local
    ? path.resolve(process.cwd(), ".opencode", "commands")
    : path.resolve(home, ".config", "opencode", "commands");

  const target = path.resolve(base, filename);

  // Path traversal prevention: ensure target stays within base
  const baseWithSep = base.endsWith(path.sep) ? base : base + path.sep;
  if (!target.startsWith(baseWithSep)) {
    throw new Error(
      `Path traversal detected: resolved path "${target}" escapes base "${base}"`
    );
  }

  return { base, target };
}

export function resolveConfigPath(local: boolean): { base: string; target: string } {
  const home = os.homedir();
  const target = local
    ? path.resolve(process.cwd(), "opencode.json")
    : path.resolve(home, ".config", "opencode", "opencode.json");
  const base = path.dirname(target);
  return { base, target };
}

type JsonObject = Record<string, unknown>;

function hasPlugin(config: JsonObject): boolean {
  const plugin = config.plugin;
  if (!Array.isArray(plugin)) return false;
  return plugin.some((entry) => {
    if (entry === PLUGIN_NAME) return true;
    if (Array.isArray(entry) && entry[0] === PLUGIN_NAME) return true;
    return false;
  });
}

export function upsertPluginConfig(local: boolean): "created" | "updated" | "skipped" | "manual" {
  const { base, target } = resolveConfigPath(local);

  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true });
  }

  if (!fs.existsSync(target)) {
    const config = {
      $schema: "https://opencode.ai/config.json",
      plugin: [PLUGIN_NAME],
    };
    fs.writeFileSync(target, JSON.stringify(config, null, 2) + "\n", "utf-8");
    return "created";
  }

  let config: JsonObject;
  try {
    config = JSON.parse(fs.readFileSync(target, "utf-8")) as JsonObject;
  } catch {
    console.warn(
      `Warning: could not parse ${target}. Add ${PLUGIN_NAME} manually to the \"plugin\" array.`
    );
    return "manual";
  }

  if (hasPlugin(config)) return "skipped";

  const plugin = Array.isArray(config.plugin) ? config.plugin : [];
  config.plugin = [...plugin, PLUGIN_NAME];
  fs.writeFileSync(target, JSON.stringify(config, null, 2) + "\n", "utf-8");
  return "updated";
}

export async function setup(args: { local?: boolean } = {}): Promise<void> {
  if (!checkNodeVersion()) {
    console.error("Error: Node.js >= 22.6.0 is required to run setup.");
    console.error("Please upgrade your Node.js version and try again.");
    process.exitCode = 1;
    return;
  }

  const local = args.local ?? false;
  const { base, target } = resolveTargetPath(local);

  try {
    if (!fs.existsSync(base)) {
      fs.mkdirSync(base, { recursive: true });
    }

    let commandStatus: "created" | "updated" | "skipped" = "created";
    if (fs.existsSync(target)) {
      const existing = fs.readFileSync(target, "utf-8");
      if (existing === COMMAND_FILE_CONTENT) {
        commandStatus = "skipped";
      } else {
        commandStatus = "updated";
      }
    }

    if (commandStatus === "skipped") {
      console.log(`Skipped: ${target} already exists with identical content.`);
    } else {
      fs.writeFileSync(target, COMMAND_FILE_CONTENT, "utf-8");
      console.log(`${commandStatus === "created" ? "Created" : "Updated"}: ${target}`);
    }

    const configStatus = upsertPluginConfig(local);
    if (configStatus !== "manual") {
      const { target: configTarget } = resolveConfigPath(local);
      console.log(`Plugin config ${configStatus}: ${configTarget}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: failed to create ${target} — ${message}`);
    process.exitCode = 1;
  }
}

export async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  if (subcommand !== "setup") {
    console.error("Usage: opencode-autoskills setup [--local]");
    process.exitCode = 1;
    return;
  }

  const local = args.includes("--local");
  await setup({ local });
}
