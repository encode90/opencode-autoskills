import { plugin } from "@opencode-ai/plugin";
import { autoskillsTool } from "./tool.js";

export default plugin({
  name: "opencode-autoskills",
  tools: [autoskillsTool],
});
