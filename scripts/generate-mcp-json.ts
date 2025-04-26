#!/usr/bin/env -S deno run -A --ext=ts
import $ from "jsr:@david/dax@0.43.0";

const mcpConfig = {
  servers: {} as Record<string, { command: string; args: string[] }>,
};

// denoの絶対パスを取得
const denoPathOutput = await $`which deno`.text();
const denoPath = denoPathOutput.trim();

// mcps/*のディレクトリを一覧取得
try {
  for await (const entry of Deno.readDir("mcps")) {
    if (entry.isDirectory) {
      const server = entry.name;
      mcpConfig.servers[server] = {
        command: denoPath,
        args: [`\${workspaceFolder}/mcps/${server}/index.ts`],
      };
    }
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.log("Warning: mcps directory not found. Creating empty mcp.json");
  } else {
    console.error("Error reading mcps directory:", error);
  }
}

await Deno.writeTextFile(
  ".vscode/mcp.json",
  JSON.stringify(mcpConfig, null, 2),
);

console.log("✨ Generated .vscode/mcp.json");
