import { tool } from "@opencode-ai/plugin";
import { checkNodeVersion } from "./version.js";

export const autoskillsTool = tool({
  name: "autoskills",
  description:
    "Use this tool when the user wants to install AI skills, set up a new project with skills, " +
    "or mentions autoskills / midudev skills. It returns instructions for the AI to run the " +
    "autoskills installer interactively.",
  execute: async () => {
    if (!checkNodeVersion()) {
      return (
        "Error: Node.js >= 22.6.0 is required to use autoskills.\n" +
        "Please upgrade your Node.js version and try again."
      );
    }
    return "Run `npx autoskills` in the project directory.";
  },
});
