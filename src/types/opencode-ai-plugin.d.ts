declare module "@opencode-ai/plugin" {
  export interface ToolOptions {
    name: string;
    description: string;
    execute: () => Promise<string> | string;
  }

  export interface Tool {
    name: string;
    description: string;
    execute: () => Promise<string> | string;
  }

  export function tool(options: ToolOptions): Tool;

  export interface PluginOptions {
    name: string;
    tools: Tool[];
  }

  export interface Plugin {
    name: string;
    tools: Tool[];
  }

  export function plugin(options: PluginOptions): Plugin;
}
