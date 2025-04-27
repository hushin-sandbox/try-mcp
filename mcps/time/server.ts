import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * MCPサーバーの設定と実装
 */
export const createServer = () => {
  const server = new McpServer({
    name: "time",
    version: "1.0.0",
    description: "現在時刻を提供するMCPサーバー",
  });

  // 現在時刻を返すツール
  server.tool(
    "get_current_time",
    "現在の時刻をISO 8601形式で返します",
    {}, // パラメータなし
    async () => {
      try {
        const currentTime = new Date().toISOString();
        return {
          content: [{ type: "text", text: currentTime }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        return {
          content: [{ type: "text", text: `時刻取得エラー: ${errorMessage}` }],
          isError: true,
        };
      }
    },
  );

  return server;
};
