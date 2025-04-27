## 開発コマンド一覧

`mcps/` 以下の 各ディレクトリに移動して開発する。

```sh
# TypeScript 型チェック
deno check .
# テスト
deno test
# サーバー起動, watch
deno task dev
```

### deno コマンド 重要事項

- deno コマンド実行前に `cd mcps/<mcp-server-name>` で terminal のディレクトリを移動すること
- `cd mcps/<mcp-server-name> && deno check .` のようにコマンドを連結して実行することは**禁止です**。必ずコマンドを分けて実行してください
