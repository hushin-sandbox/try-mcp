import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchSchema } from "./schema-fetcher.ts";
import { SchemaTraverser } from "./traverser.ts";
import { Config, ConfigSchema } from "./types.ts";

/**
 * MCPサーバーの設定と実装
 */
export const createServer = (config: Config) => {
  const server = new McpServer({
    name: "graphql-schema-traverser",
    version: "1.0.0",
    description:
      "GraphQLスキーマから特定のtypeから辿れる型を抽出するMCPサーバー",
  });

  const schemaTraverser = new SchemaTraverser();

  server.tool(
    "traverse-schema",
    "GraphQLスキーマから特定のtypeから辿れる型を抽出",
    {
      typeName: z.string().min(1, "type名を指定してください"),
    },
    async ({ typeName }) => {
      try {
        // スキーマの取得
        const schema = await fetchSchema(config);

        // 指定された型から到達可能な型を収集
        const reachableTypes = schemaTraverser.traverseFromType(
          schema,
          typeName,
        );

        // SDL形式で出力
        const sdl = schemaTraverser.generateSDL(reachableTypes);

        return {
          content: [{ type: "text", text: sdl }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `エラー: ${message}` }],
          isError: true,
        };
      }
    },
  );

  return server;
};

// 設定のバリデーション関数
export function validateConfig(config: unknown): Config {
  return ConfigSchema.parse(config);
}
