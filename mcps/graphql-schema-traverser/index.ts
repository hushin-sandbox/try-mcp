import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.ts";
import { ConfigSchema } from "./types.ts";

// 環境変数から設定を読み込む
const config = ConfigSchema.parse({
  endpoint: Deno.env.get("GRAPHQL_ENDPOINT"),
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
