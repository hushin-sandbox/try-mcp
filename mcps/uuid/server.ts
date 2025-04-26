import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { v1 as uuidv1, v3 as uuidv3, v5 as uuidv5, validate } from "uuid";
import { z } from "zod";

/**
 * UUID生成用MCPサーバーの設定と実装
 */
export const createServer = () => {
  // MCPサーバーの初期化
  const server = new McpServer({
    name: "UUID Generator",
    version: "1.0.0",
    description: "シンプルなUUID生成ツールを提供するMCPサーバー",
  });

  // UUIDに関する基本情報リソースの追加
  server.resource(
    "uuid-info",
    "uuid-info://docs",
    {
      description: "UUIDの基本情報と各バージョンの説明",
    },
    async () => ({
      contents: [
        {
          uri: "uuid-info://docs",
          text: `# UUID (Universally Unique Identifier)

UUIDは、グローバルに一意性が保証される識別子です。異なるバージョンがあり、それぞれ特性が異なります。

## UUIDのバージョン

- **UUID v1**: タイムスタンプベース。生成時のタイムスタンプとMAC（ネットワークカード）アドレスに基づきます。
- **UUID v3**: 名前ベース。MD5ハッシュを使用します。
- **UUID v4**: ランダム生成。完全にランダム（または擬似ランダム）な値を使用します。
- **UUID v5**: 名前ベース。SHA-1ハッシュを使用します。

## 一般的な用途

- データベースの主キー
- 分散システムでの一意の識別子
- セッションID
- ファイル名やリソース識別子`,
        },
      ],
    }),
  );

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

  // カスタムUUIDを生成するツール（バージョンやオプションの指定が可能）
  server.tool(
    "generate-custom-uuid",
    "さまざまなオプションでUUIDを生成します",
    {
      version: z
        .enum(["v1", "v3", "v4", "v5"])
        .default("v4")
        .describe("生成するUUIDのバージョン"),
      namespace: z.string().optional().describe("v3/v5のみ：名前空間UUID"),
      name: z.string().optional().describe("v3/v5のみ：名前文字列"),
      uppercase: z
        .boolean()
        .default(false)
        .describe("大文字で出力するかどうか"),
      noDashes: z
        .boolean()
        .default(false)
        .describe("ハイフンなしで出力するかどうか"),
    },
    async (params) => {
      try {
        let uuid: string;

        switch (params.version) {
          case "v1":
            uuid = uuidv1();
            break;
          case "v3":
            if (!params.namespace || !params.name) {
              return {
                content: [
                  {
                    type: "text",
                    text: "UUID v3の生成には、namespaceとnameの両方が必要です",
                  },
                ],
                isError: true,
              };
            }
            if (!validate(params.namespace)) {
              return {
                content: [
                  {
                    type: "text",
                    text: "無効な名前空間UUIDが指定されました",
                  },
                ],
                isError: true,
              };
            }
            uuid = await uuidv3(params.name, params.namespace);
            break;
          case "v4":
            uuid = crypto.randomUUID();
            break;
          case "v5":
            if (!params.namespace || !params.name) {
              return {
                content: [
                  {
                    type: "text",
                    text: "UUID v5の生成には、namespaceとnameの両方が必要です",
                  },
                ],
                isError: true,
              };
            }
            if (!validate(params.namespace)) {
              return {
                content: [
                  {
                    type: "text",
                    text: "無効な名前空間UUIDが指定されました",
                  },
                ],
                isError: true,
              };
            }
            uuid = await uuidv5(params.name, params.namespace);
            break;
          default:
            return {
              content: [
                {
                  type: "text",
                  text: "サポートされていないUUIDバージョンです",
                },
              ],
              isError: true,
            };
        }

        // フォーマットオプションの適用
        if (params.uppercase) {
          uuid = uuid.toUpperCase();
        }

        if (params.noDashes) {
          uuid = uuid.replace(/-/g, "");
        }

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

  // UUIDの検証ツール
  server.tool(
    "validate-uuid",
    "文字列がUUIDとして有効かどうかを検証します",
    {
      uuid: z.string().describe("検証するUUID文字列"),
    },
    async (params) => {
      try {
        const isValid = validate(params.uuid);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  isValid,
                  message: isValid
                    ? "有効なUUID形式です"
                    : "無効なUUID形式です",
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `UUIDの検証に失敗しました: ${
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
};
