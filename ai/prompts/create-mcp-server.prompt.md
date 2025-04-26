# TypeScript SDK を使用した MCP サーバー実装

## イントロダクション

Model Context Protocol（MCP）は、アプリケーションが LLM に文脈を提供するための標準化された方法を定義するプロトコルです。
このルールでは、TypeScript SDK を使用して MCP サーバーを実装するための標準的な構造とベストプラクティスを定義します。
MCP サーバーはツール（機能）を通じて、LLM アプリケーションと相互作用するための標準化されたインターフェイスを提供します。

※ MCP サーバーはリソース（データ）、プロンプト（テンプレート） も提供できますが、非対応のクライアントが多いため説明を省略します。

## プロジェクト構成

このプロジェクトでは、MCP サーバーの実装は `mcps/` ディレクトリ配下に機能単位でディレクトリを作成して管理します。
各 MCP サーバーは独立した deno project として実装します。

### ディレクトリ構成例

新しい MCP サーバーを作成する場合は、以下のような構成にします。後述するスクリプトで雛形が生成されます。

```
mcps/
  mcp-server-name/
    deno.json
    index.ts       # エントリーポイント(必要がない限り編集しない)
    server.ts      # MCPサーバーの実装
    server.test.ts # MCPサーバーのテスト
```

参考実装として mcps/uuid/ があります。

### 新しい MCP サーバーの作成手順

1. 要件の明確化
2. `./scripts/create-mcp-template.ts --name <mcp-server-name>` で雛形を生成
3. `cd mcps/<mcp-server-name>` で terminal のディレクトリを移動
4. server.ts を編集
5. パッケージを使うとき、必要に応じて `deno add jsr:@david/dax@0.42.0` のようにコマンドを実行して `deno.json` に依存を追加する。
   - **deno.json** を直接編集しないこと
6. 実装が終わったら `deno check .` で TypeScript 構文チェック
7. server.test.ts を編集しテストを書き、 `deno test` で実行
8. MCP インスペクターでのテスト `npx @modelcontextprotocol/inspector deno task dev`
   - open http://localhost:6274/

## パターンの説明

MCP サーバーの実装は、以下の主要コンポーネントで構成されます：

### 1. サーバー設定と初期化

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod'; // パラメータバリデーション用

// MCPサーバーインスタンスを作成 (server.ts で createServer 内で定義)
const server = new McpServer({
  name: 'サーバー名',
  version: '1.0.0',
});

// サーバーコンポーネントを設定（以下のセクションで詳細を説明）
// ...ツールの定義

// トランスポートを選択して接続 (index.ts で定義)
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 2. ツール（Tools）の実装

ツールは、LLM が実行できる機能/アクションを表します：

```typescript
// シンプルなツールの定義
server.tool(
  'calculator', // ツール名
  '四則演算を実行し、計算結果を返します',
  {
    a: z.number(),
    b: z.number(),
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  }, // パラメータスキーマ（Zodを使用）
  async ({ a, b, operation }) => {
    let result;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return {
            content: [{ type: 'text', text: '0で除算できません' }],
            isError: true,
          };
        }
        result = a / b;
        break;
    }
    return {
      content: [{ type: 'text', text: String(result) }],
    };
  }
);

// 外部APIを呼び出すツール
server.tool(
  'fetch-data',
  '指定されたエンドポイントからデータを取得します',
  { endpoint: z.string() },
  async ({ endpoint }) => {
    try {
      const response = await fetch(`https://api.example.com/${endpoint}`);
      const data = await response.json();
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `エラー: ${error.message}` }],
        isError: true,
      };
    }
  }
);
```

## 実装例

以下は、簡単な計算機能を提供する MCP サーバーの実装例です：

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * MCPサーバーの設定と実装
 */
export const createServer = () => {
  // サーバーの作成
  const server = new McpServer({
    name: 'Calculator',
    version: '1.0.0',
  });

  // 計算機能を提供するツール
  server.tool(
    'calculate',
    '数式を評価して計算結果を返します',
    {
      expression: z.string().describe('計算式（例: 2 + 2、5 * 3 など）'),
    },
    async ({ expression }) => {
      try {
        // 注意: 実際のアプリケーションでは、eval の使用は避け、安全な計算ライブラリを使用してください
        const result = eval(expression);

        return {
          content: [{ type: 'text', text: String(result) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `計算エラー: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  return server;
};
```

## 一般的な落とし穴

### 1. エラー処理の欠落

ツールやリソースのハンドラで適切なエラー処理を行わないと、予期しない例外が発生する可能性があります。常に try-catch ブロックを使用し、エラーステータスを適切に返してください。

```typescript
// 良い例
server.tool('example', { input: z.string() }, async ({ input }) => {
  try {
    // 処理
    return { content: [{ type: 'text', text: '結果' }] };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `エラー: ${error.message}` }],
      isError: true,
    };
  }
});

// 悪い例
server.tool('example', { input: z.string() }, async ({ input }) => {
  // エラー処理なし
  const result = someFunctionThatMightThrow(input);
  return { content: [{ type: 'text', text: result }] };
});
```

### 2. パラメータバリデーションの不足

Zod スキーマを適切に設定せず、必要な型チェックやバリデーションを行わないと、予期しない入力データに対して脆弱になります。

```typescript
// 良い例
{
  userId: z.string().uuid().describe("有効なUUID形式のユーザーID"),
  count: z.number().int().positive().describe("取得するアイテム数")
}

// 悪い例
{
  userId: z.string(),
  count: z.number()
}
```

### 3. 無限ループやブロッキング操作

非同期処理を適切に扱わないと、サーバーが応答しなくなる可能性があります。

```typescript
// 良い例
server.tool('longProcess', {}, async () => {
  const result = await asyncOperation();
  return { content: [{ type: 'text', text: result }] };
});

// 悪い例
server.tool('blockingProcess', {}, () => {
  // ブロッキング操作
  const result = synchronousLongRunningOperation();
  return { content: [{ type: 'text', text: result }] };
});
```

### 4. セキュリティリスクの無視

特に外部入力を処理する場合や、ファイルシステムやデータベースにアクセスする場合は、セキュリティリスクに注意が必要です。

```typescript
// 良い例
server.tool(
  'readFile',
  {
    path: z.string().refine((path) => !path.includes('..'), {
      message: "パスに'..'を含めることはできません",
    }),
  },
  async ({ path }) => {
    // 安全なパス検証後に処理
  }
);

// 悪い例
server.tool('unsafeRead', { path: z.string() }, async ({ path }) => {
  // パス検証なしでファイル読み込み
});
```

## ベストプラクティス

1. **明確なドキュメント**：各リソース、ツール、プロンプトには明確な説明を提供する
2. **適切なエラー処理**：すべてのエラーを捕捉し、適切なエラーメッセージを返す
3. **入力検証**：Zod スキーマを使用して、すべての入力パラメータを厳密に検証する
4. **セキュリティ対策**：特に外部入力を扱う場合は、適切なセキュリティ対策を実装する
5. **モジュール化**：複雑なサーバーはコンポーネントに分割し、責任を分離する
6. **テスト**：各リソース、ツール、プロンプトのユニットテストを作成する
7. **動的状態管理**：必要に応じて、サーバーの状態を適切に管理する。状態変更時にはリソースの更新通知を送信する
8. **パフォーマンス考慮**：重い処理はバックグラウンドで実行し、応答性を維持する
9. **統一されたレスポンスフォーマット**：一貫したレスポンスフォーマットを維持する
10. **進捗報告**：長時間実行される操作では、進捗状況を報告する

## 要件の明確化

MCP サーバーを実装する際、ユーザーの要件が曖昧な場合は、以下のような質問を通じて明確化を図ります：

1. **機能の範囲の明確化**

   - どのような機能（ツール）が必要ですか？
   - 各ツールの入力パラメータと出力形式はどのようにすべきですか？
   - エラーケースにはどのように対応すべきですか？

2. **データの構造と提供方法の明確化**

   - どのようなデータ構造を扱う必要がありますか？
   - データはどのような形式で提供されるべきですか？
   - データの更新頻度はどのくらいですか？
   - データの更新は自動で検知する必要がありますか？

3. **性能要件**

   - 同時接続数はどのくらい想定されますか？
   - レスポンス時間の要件はありますか？
   - データ量の制限はありますか？

4. **セキュリティ要件**
   - どのようなセキュリティ対策が必要ですか？
   - データのアクセス制御は必要ですか？
   - 認証・認可の要件はありますか？

これらの質問を通じて要件を明確にし、適切な実装戦略を決定します。

## 参考資料

より詳細に知りたいときは下記資料を参照すること:

- https://modelcontextprotocol.io/llms-full.txt
- https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/README.md
