import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * MCPサーバーの設定と実装
 */
export const createServer = () => {
  // サーバーの作成
  const server = new McpServer({
    name: "string-reverser",
    version: "1.0.0",
  });

  // 文字列を反転するツール
  server.tool(
    "reverse",
    "文字列を反転して返します",
    {
      text: z.string().describe("反転したい文字列"),
    },
    async ({ text }) => {
      const reversed = [...text].reverse().join("");
      return {
        content: [{ type: "text", text: reversed }],
      };
    },
  );

  return server;
};
