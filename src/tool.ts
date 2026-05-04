import { tool } from "@opencode-ai/plugin";
import { checkNodeVersion } from "./version.js";

export const autoskillsTool = tool({
  description:
    "Use this tool when the user wants to install AI skills, set up a new project with skills, " +
    "or mentions autoskills / midudev skills. It returns instructions for the AI to run the " +
    "autoskills installer interactively.",
  args: {},
  execute: async () => {
    if (!checkNodeVersion()) {
      return (
        "Error: Node.js >= 22.6.0 is required to use autoskills.\n" +
        "Please upgrade your Node.js version and try again."
      );
    }
    return (
      "Run `npx autoskills` in the current project directory using the bash tool. " +
      "Do not inspect project files yourself and do not parse the output; let autoskills handle " +
      "detection, interactive selection, and installation."
    );
  },
});
