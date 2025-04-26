# try-mcp

MCP サーバを作って試す

## Prerequisites

- Deno v2 以上

## Setup

### .vscode/mcp.json

```sh
./scripts/generate-mcp-json.ts
```

.vscode/mcp.json を開き MCP サーバーを起動（Jira の環境変数を入力）

- `JIRA_API_TOKEN` - Jira Cloud の API トークン
  - https://id.atlassian.com/manage-profile/security/api-tokens から取得可能

## Usage

VSCode Copilot Chat で試す。

実験で作ったのであまり意味はない。

```
UUID を作成して ai-out/(uuid).md に 「hoge」と書かれたファイルを作って
```

```
Jiraのプロジェクト一覧取得して
```

## Development

[TypeScript SDK を使用した MCP サーバー実装 プロンプト](ai/prompts/create-mcp-server.prompt.md)

`mcps/` 以下の 各ディレクトリに移動して開発する。

```sh
# TypeScript 型チェック
deno check .
# テスト
deno test
# サーバー起動, watch
deno task dev
# MCP インスペクターを使用して、サーバーの機能をテスト
npx @modelcontextprotocol/inspector deno task dev
```

http://localhost:6274/ で確認

## 参考にしたもの

### MCP 公式

- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Building MCP with LLMs - Model Context Protocol](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms)

### MCP 記事

- [MCP サーバをつくって学ぶ | @bc_rikko](https://bcrikko.github.io/til/posts/2025-04-07/what-is-mcp/)
- [Deno で RooCode 用にローカル MCP サーバーをさっと作る](https://zenn.dev/mizchi/articles/deno-mcp-server)

### Deno

- [mizchi/deno-ai-bestpractice](https://github.com/mizchi/deno-ai-bestpractice)
- [Deno first でやっていく](https://zenn.dev/mizchi/articles/deno-first-choice)
