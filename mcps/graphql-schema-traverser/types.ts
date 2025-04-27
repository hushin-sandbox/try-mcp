/**
 * GraphQL schema traverser の型定義
 */

/**
 * スキーマトラバーサーの入力パラメータ
 */
export interface SchemaTraverserInput {
  /** GraphQL endpoint URL */
  endpoint: string;
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
