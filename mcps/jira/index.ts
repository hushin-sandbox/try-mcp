import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, validateConfig } from "./server.ts";

// 環境変数から設定を読み込む
const config = validateConfig({
  baseUrl: Deno.env.get("JIRA_BASE_URL"),
  email: Deno.env.get("JIRA_EMAIL"),
  apiToken: Deno.env.get("JIRA_API_TOKEN"),
});

async function main() {
  const server = createServer(config);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  Deno.exit(1);
});
