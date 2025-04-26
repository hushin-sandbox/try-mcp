import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "npm:zod";

/**
 * MCPサーバーの設定と実装
 */
export const createServer = () => {
  // サーバーの作成
  const server = new McpServer({
    name: "string-counter", // サーバー名を 'string-counter' に変更
    version: "1.0.0",
  });

  // 文字列の長さを返すツール
  server.tool(
    "count-string", // ツール名を 'count-string' に設定
    {
      text: z.string().describe("長さを計算する文字列"), // 入力パラメータ 'text' を定義
    },
    async ({ text }) => {
      const length = text.length; // 文字列の長さを計算
      return {
        content: [{ type: "text", text: String(length) }], // 結果をテキストコンテンツとして返す
      };
    },
  );

  return server;
};
