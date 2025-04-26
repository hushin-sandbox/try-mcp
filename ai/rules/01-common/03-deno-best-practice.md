# AI Coding with Deno: ベストプラクティス

本プロジェクトでは、スクリプトモードとモジュールモードの 2 つのモードを想定する。以下に解説する。

## コーディングポリシー

- 最初に型と、それを処理する関数のインターフェースを考える
- コードのコメントとして、そのファイルがどういう仕様かを可能な限り明記する
- 実装が内部状態を持たないとき、 class による実装を避けて関数を優先する
- 副作用を抽象するために、アダプタパターンで外部依存を抽象し、テストではインメモリなアダプタで処理する

## テストの書き方

`@std/expect` と `@std/testing/bdd` を使う。
とくに実装上の理由がない限り、 `describe` による入れ子はしない。

```ts
import { expect } from '@std/expect';
import { test } from '@std/testing/bdd';

test('2+3=5', () => {
  expect(add(2, 3)).toBe(5);
});
```

## 実装モード: スクリプトモード

- 外部依存を可能な限り減らして、一つのファイルに完結してすべてを記述する
- テストコードも同じファイルに記述してください
- スクリプトモードは `@script` がコード中に含まれる場合、あるいは `scripts/*` 以下のファイルが該当します。

スクリプトモードの例

```ts
/* @script */
/**
 * 足し算を行うモジュール
 */
function add(a: number, b: number): number {
  return a + b;
}

// deno run add.ts で動作確認するエントリポイント
if (import.meta.main) {
  console.log(add(1, 2));
}

/// test
import { expect } from '@std/expect';
import { test } from '@std/testing/bdd';

test('add(1, 2) = 3', () => {
  expect(add(1, 2)).toBe(3);
});
```

あなた（コーディングエージェント）は、まず `deno run add.ts` で実行して、要求に応じて `deno test -A <filename>` で実行可能なようにテストを増やしていく。

スクリプトモードでは曖昧なバージョンの import を許可する。

優先順

- `jsr:` のバージョン固定
- `jsr:`
- `npm:`

`https://deno.land/x/*` は代替がない限りは推奨しない。

```ts
// OK
import $ from 'jsr:@david/dax@0.42.0';
import $ from 'jsr:@david/dax';
import { z } from 'npm:zod';

// Not Recommended
import * as cbor from 'https://deno.land/x/cbor';
```

## 実装モード: モジュールモード

モジュールモードはディレクトリの下で複数のファイルで構成される。

例

```
xxx/
  deno.json
  deno.lock
  main.ts
  lib.ts
  lib.test.ts
```

モジュールモードではスクリプトモードと違って、ライブラリの参照に `jsr:` や `npm:` を推奨しない。
モジュールを参照する場合、 `deno add jsr:@david/dax@0.42.0` のようにして、 `deno.json` に依存を追加する。

```ts
// OK
import $ from '@david/dax';

// NG
import $ from 'jsr:@david/dax@0.42.0';
```
