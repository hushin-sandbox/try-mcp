## コードスタイルとパターン

本プロジェクトはTypeScriptを使用しています。

- 明示的な型アノテーションを使用
- `any`型は避ける
- 複雑な型は`interface`/`type`で定義
- 型アサーション `as` の過剰使用を避ける
- 早期リターンでネスト削減
- 関数型アプローチを優先する：
  - `map`、`filter`、`reduce` などを活用する
- 純粋関数: 副作用を持たない関数を優先


### 型定義のベストプラクティス

```typescript
// Prefer interfaces over type literal aliases
interface User {
  firstName: string;
  lastName: string;
}

// anyの代わりにunknownを使い、型ガードを活用
function processValue(x: unknown): void {
  if (typeof x === 'string') {
    console.log(x.toUpperCase());
  }
}

// 関数の戻り値型を明示
function fetchUser(id: string): Promise<Result<User, ApiError>> {
  // 実装
}
```
