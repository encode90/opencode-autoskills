export function tool(options: {
  name: string;
  description: string;
  execute: () => Promise<string> | string;
}) {
  return {
    name: options.name,
    description: options.description,
    execute: options.execute,
  };
}

export function plugin(options: { name: string; tools: unknown[] }) {
  return {
    name: options.name,
    tools: options.tools,
  };
}
