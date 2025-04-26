# Deno CLI Script 作成ルール

`./scripts/script-name.ts` に Deno CLI Script を作ってください。

## テンプレート

```ts
#!/usr/bin/env -S deno run -A --ext=ts
import { parseArgs } from 'node:util';
import $ from 'jsr:@david/dax@0.43.0';

// コマンド実行時に > ls みたいな形で出力する
$.setPrintCommand(true);

// 引数のパース
const parsed = parseArgs({
  args: Deno.args,
  options: {},
});

// run a command
await $`echo 5`; // outputs: 5

// outputting to stdout and running a sub process
await $`echo 1 && deno run main.ts`;

// Getting output
const result = await $`echo 1`.text();
console.log(result); // 1
```

## 作成後 実行権限を付与

```sh
chmod +x ./scripts/script-name.ts
```
