import type { Plugin } from "@opencode-ai/plugin";
import { autoskillsTool } from "./tool.js";

export const OpencodeAutoskillsPlugin: Plugin = async () => {
  return {
    tool: {
      autoskills: autoskillsTool,
    },
  };
};

export default OpencodeAutoskillsPlugin;
