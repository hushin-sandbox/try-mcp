import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SchemaFetcher } from "./schema-fetcher.ts";
import { SchemaTraverser } from "./traverser.ts";
import { SchemaFetchError, SchemaTraverseError } from "./types.ts";

/**
 * MCPサーバーの設定と実装
 */
export const createServer = () => {
  const server = new McpServer({
    name: "graphql-schema-traverser",
    version: "1.0.0",
    description:
      "GraphQLスキーマから特定のtypeから辿れる型を抽出するMCPサーバー",
  });

  const schemaFetcher = new SchemaFetcher();
  const schemaTraverser = new SchemaTraverser();

  server.tool(
    "traverse-schema",
    "GraphQLスキーマから特定のtypeから辿れる型を抽出",
    {
      endpoint: z.string().url("有効なGraphQL endpoint URLを指定してください"),
      typeName: z.string().min(1, "type名を指定してください"),
    },
    async ({ endpoint, typeName }) => {
      try {
        // スキーマの取得
        const schema = await schemaFetcher.fetchSchema(endpoint);

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
