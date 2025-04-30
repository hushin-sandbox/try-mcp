import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * MCPサーバーの設定と実装
 */
export const createServer = () => {
  const server = new McpServer({
    name: "random-line-selector",
    version: "1.0.0",
    description: "複数行のテキストからランダムに1行を選択するMCPサーバー",
  });

  // 複数行のテキストからランダムに1行を選択するツール
  server.tool(
    "select_random_line",
    "与えられた複数行のテキストからランダムに1行を選択して返します。",
    {
      text: z.string().describe("複数行のテキスト"),
    },
    async ({ text }) => {
      const lines = text.split("\n").filter((line) => line.trim() !== ""); // 空行を除外

      if (lines.length === 0) {
        return {
          content: [{ type: "text", text: "有効な行が見つかりませんでした。" }],
          isError: true,
        };
      }

      const randomIndex = Math.floor(Math.random() * lines.length);
      const selectedLine = lines[randomIndex];

      return {
        content: [{ type: "text", text: selectedLine }],
      };
    },
  );

  return server;
};
