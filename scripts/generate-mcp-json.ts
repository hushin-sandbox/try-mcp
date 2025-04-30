#!/usr/bin/env -S deno run -A --ext=ts
import $ from "jsr:@david/dax@0.43.0";

const mcpConfig = {
  "inputs": [
    {
      "type": "promptString",
      "id": "jira_base_url",
      "description": "JIRA_BASE_URL (e.g. https://your-domain.atlassian.net)",
      "password": false,
    },
    {
      "type": "promptString",
      "id": "jira_email",
      "description": "JIRA_EMAIL (e.g. your-email@example.com)",
      "password": false,
    },
    {
      "type": "promptString",
      "id": "jira_api_token",
      "description": "JIRA_API_TOKEN",
      "password": true,
    },
    {
      "type": "promptString",
      "id": "graphql_endpoint",
      "description": "GRAPHQL_ENDPOINT (e.g. http://localhost:4000/graphql)",
      "password": false,
    },
  ],
  servers: {} as Record<
    string,
    { command: string; args: string[]; env?: Record<string, string> }
  >,
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
        args: ["-A", `\${workspaceFolder}/mcps/${server}/index.ts`],
      };

      if (server === "jira") {
        mcpConfig.servers[server].env = {
          "JIRA_BASE_URL": "${input:jira_base_url}",
          "JIRA_EMAIL": "${input:jira_email}",
          "JIRA_API_TOKEN": "${input:jira_api_token}",
        };
      } else if (server === "graphql-schema-traverser") {
        mcpConfig.servers[server].env = {
          "GRAPHQL_ENDPOINT": "${input:graphql_endpoint}",
        };
      }
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

// --- Generate global-mcp.json ---
const globalMcpConfig = JSON.parse(JSON.stringify(mcpConfig)); // Deep copy
const cwd = Deno.cwd();

for (const serverKey in globalMcpConfig.servers) {
  const server = globalMcpConfig.servers[serverKey];
  server.args = server.args.map((arg: string) =>
    arg.replace(/\${workspaceFolder}/g, cwd)
  );
}

await Deno.writeTextFile(
  ".vscode/global-mcp.json",
  JSON.stringify(globalMcpConfig, null, 2),
);
console.log("✨ Generated .vscode/global-mcp.json");
