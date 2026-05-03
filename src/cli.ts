import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { checkNodeVersion } from "./version.js";

const COMMAND_FILE_CONTENT = `When the user types \`/autoskills\`, invoke the \`autoskills\` custom tool.`;

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

    if (fs.existsSync(target)) {
      const existing = fs.readFileSync(target, "utf-8");
      if (existing === COMMAND_FILE_CONTENT) {
        console.log(`Skipped: ${target} already exists with identical content.`);
        return;
      }
    }

    fs.writeFileSync(target, COMMAND_FILE_CONTENT, "utf-8");
    console.log(`Created: ${target}`);
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
