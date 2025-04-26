# try-mcp

MCP サーバを作って試す

## Prerequisites

- Deno v2 以上

## Setup

### .vscode/mcp.json

```sh
cp .vscode/mcp.example.json  .vscode/mcp.json
code .vscode/mcp.json
# deno のパスを絶対パスに変える
```

## Usage

VSCode Copilot Chat で試す。

実験で作ったのであまり意味はない。

```
UUID を作成して ai-out/(uuid).md に 「hoge」と書かれたファイルを作って
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

## 参考リンク

### 公式

- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Building MCP with LLMs - Model Context Protocol](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms)

### 記事

- [MCP サーバをつくって学ぶ | @bc_rikko](https://bcrikko.github.io/til/posts/2025-04-07/what-is-mcp/)
- [Deno で RooCode 用にローカル MCP サーバーをさっと作る](https://zenn.dev/mizchi/articles/deno-mcp-server)
