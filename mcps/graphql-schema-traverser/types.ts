/**
 * GraphQL schema traverser の型定義
 */

import { z } from "zod";

/**
 * 設定スキーマ
 */
export const ConfigSchema = z.object({
  endpoint: z.string().url("有効なGraphQL endpoint URLを指定してください"),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * スキーマトラバーサーの入力パラメータ
 */
export interface SchemaTraverserInput {
  /** 開始点となるtype名 */
  typeName: string;
}

/**
 * スキーマ取得のエラー型
 */
export class SchemaFetchError extends Error {
  constructor(message: string, public override readonly cause?: unknown) {
    super(message);
    this.name = "SchemaFetchError";
  }
}

/**
 * スキーマトラバースのエラー型
 */
export class SchemaTraverseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaTraverseError";
  }
}
