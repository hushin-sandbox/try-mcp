# try-mcp

MCP サーバを作って試す

## Setup

### build

```sh
cd mcps/uuid
npm i
npm run build
```

TODO pnpm workspace

### .vscode/mcp.json

```sh
cp .vscode/mcp.example.json  .vscode/mcp.json
code .vscode/mcp.json
# node のパスを絶対パスに変える
```

📝 asdf などで Node.js をインストールしていると "node" で動かない。おそらく non-login な /bin/sh を使っているのでパスが通っていない.

## Usage

VSCode Copilot Chat で試す。

実験で作ったのであまり意味はない。

```
UUID を作成して ai-out/(uuid).md に 「hoge」と書かれたファイルを作って
```

## Development

[Building MCP with LLMs - Model Context Protocol](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms)

## 参考リンク

- [Model Context Protocol](https://github.com/modelcontextprotocol)
