# UUID 生成 MCP サーバー

Model Context Protocol（MCP）を用いて、シンプルな UUID 生成機能を提供するサーバーです。

## 機能

この MCP サーバーは以下の機能を提供します：

### リソース

- `uuid-info`: UUID に関する基本情報と各バージョンの説明

### ツール

- `generate-uuid`: パラメータなしでランダムな UUID v4 を生成します
- `generate-custom-uuid`: さまざまなオプション（バージョン、フォーマット等）で UUID を生成します
- `validate-uuid`: 文字列が UUID として有効かどうかを検証します

## セットアップ

### 前提条件

- Node.js 18.0 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/uuid-mcp-server.git
cd uuid-mcp-server

# 依存パッケージをインストール
npm install
```

### ビルド

```bash
npm run build
```

### 実行

```bash
npm start
```

## 使用方法

### MCP インスペクターでのテスト

MCP インスペクターを使用して、サーバーの機能をテストできます：

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

### Claude Desktop との連携

Claude Desktop 設定ファイルに以下の設定を追加することで、この MCP サーバーを Claude Desktop で利用できます：

```json
{
  "servers": [
    {
      "name": "UUID Generator",
      "command": "node",
      "args": ["パスを指定/try-mcp/dist/index.js"],
      "transport": "stdio"
    }
  ]
}
```

## ツールの使い方例

### シンプルな UUID 生成

`generate-uuid` ツールは、パラメータなしで実行すると UUID v4 を生成します。

### カスタム UUID 生成

`generate-custom-uuid` ツールは、以下のパラメータを受け付けます：

- `version`: 生成する UUID のバージョン（"v1", "v3", "v4", "v5"）
- `namespace`: v3/v5 用の名前空間 UUID
- `name`: v3/v5 用の名前文字列
- `uppercase`: 大文字で出力するかどうか
- `noDashes`: ハイフンなしで出力するかどうか

### UUID 検証

`validate-uuid` ツールは、文字列が UUID として有効かどうかを検証します：

- `uuid`: 検証する文字列

## ライセンス

MIT
