import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * UUID生成用MCPサーバーの設定と実装
 */
export function createServer() {
  // MCPサーバーの初期化
  const server = new McpServer({
    name: "UUID Generator",
    version: "1.0.0",
    description: "シンプルなUUID生成ツールを提供するMCPサーバー",
  });

  // 基本的なUUID v4を生成するツール
  server.tool(
    "generate-uuid",
    "パラメータなしでランダムなUUID v4を生成します",
    async () => {
      try {
        const uuid = crypto.randomUUID();
        return {
          content: [
            {
              type: "text",
              text: uuid,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `UUIDの生成に失敗しました: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}
