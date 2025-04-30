import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
  IntrospectionQuery,
} from "npm:graphql";
import { SchemaFetchError } from "./types.ts";

/**
 * GraphQLエンドポイントからスキーマを取得
 * @param config GraphQLエンドポイントの設定
 * @returns GraphQLスキーマ
 * @throws SchemaFetchError スキーマ取得に失敗した場合
 */
export async function fetchSchema(
  config: { endpoint: string },
): Promise<GraphQLSchema> {
  try {
    const query = getIntrospectionQuery();
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch schema: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    // GraphQLのエラーチェック
    if (result.errors) {
      throw new Error(
        `GraphQL Error: ${
          result.errors.map((e: { message: string }) => e.message).join(", ")
        }`,
      );
    }

    const introspectionQuery = result.data as IntrospectionQuery;
    return buildClientSchema(introspectionQuery);
  } catch (error) {
    throw new SchemaFetchError(
      "Failed to fetch and build GraphQL schema",
      error,
    );
  }
}
