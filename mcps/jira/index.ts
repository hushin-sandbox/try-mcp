import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, validateConfig } from "./server.ts";

// 環境変数から設定を読み込む
const config = validateConfig({
  host: Deno.env.get("JIRA_HOST"),
  email: Deno.env.get("JIRA_EMAIL"),
  token: Deno.env.get("JIRA_API_TOKEN"),
});

const server = createServer(config);
const transport = new StdioServerTransport();

console.error("Starting Jira MCP Server...");
await server.connect(transport);
