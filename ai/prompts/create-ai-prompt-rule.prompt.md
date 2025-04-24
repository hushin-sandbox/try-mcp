# 効果的な AI プロンプトルールの作成

このメタルールは、効果的な AI プロンプトルールを作成するための包括的なガイドラインを提供します。これらのルールは、プロジェクトの `ai/prompts/` ディレクトリに保存され、AI がコードベース、規約、および設定を理解するのに役立ちます。

## ファイル命名規則

プロンプトルールのファイルは以下の命名規則に従う必要があります：

- ファイル名は `.prompt.md` で終わる必要があります
- 例：`react-component.prompt.md`, `api-design.prompt.md`, `testing.prompt.md`
- ファイル名は小文字のケバブケースを使用します
- 複数の単語は `-` で区切ります

## AI プロンプトルールとは？

プロンプトルールは、プロジェクト固有の指示を AI に提供する推奨される方法です。コードと一緒に `ai/prompts/` に保存され、AI の機能で参照される際に自動的に活用されます。

以下のような内容を AI に教えるための構造化された知識ベースとして考えてください：

- コーディング規約とスタイルガイド
- アーキテクチャパターン
- API の使用方法とインターフェース
- ドメイン固有の知識
- 個人やチームの設定

## ルールファイルの構造

柔軟性はありますが、適切に構造化されたルールファイルは、人間と AI の両方にとって明確さを向上させます。以下のコンポーネントを含めることを検討してください：

### 1. コンテンツセクション（推奨構造）

ルールの内容を論理的に整理します。マークダウンの見出し（`##`、`###`）の使用を推奨します。

#### イントロダクション / 問題

- このルールが解決する問題や定義するパターンを簡潔に説明
- このパターン/規約がプロジェクトにとって重要な理由を説明
- このルールが通常関連する状況を説明

#### パターンの説明

- 推奨されるパターンや規約を明確に文書化
- テキストによる説明と明確なコード例を組み合わせて使用（言語固有のコードブロックを使用）
- 関連する主要なコンポーネント、関数、概念を強調
- 必要に応じて、他の関連するルールへのリンクを含める

#### 実装手順（該当する場合）

- ルールがプロセスを説明する場合は、明確な段階的なガイドを提供
- 順序付きリストを使用
- 決定ポイントやバリエーションを特定

#### 実例（強く推奨）

- 現在のリポジトリの実際のコードへのリンク
- リンクされたコードがこのルールの良い例である理由を簡潔に説明
- 説明されているルールに焦点を当てた例を維持

#### 一般的な落とし穴 / アンチパターン

- このルールに関連する一般的な間違いや逸脱をリスト
- これらの問題を認識する方法を説明
- 修正方法や回避方法を提案

**注意：** ルールの複雑さに応じてこの構造を適応させてください。より単純なルールは、簡単な説明や重要なポイントのみで十分かもしれません。

## ベストプラクティス

- **シンプルに始めて、反復する：** 最初から完璧を目指さないでください。基本的な規約のルールから始めて、AI の動作を観察し、ギャップを特定しながら時間とともに追加/改良していきます。
- **具体的かつ柔軟に：** 具体的な例を含む、明確で実行可能なガイダンスを提供します。厳格な規約が必要な場合を除き、「必須」「常に」ではなく、「推奨」「検討」「通常」などの推奨言語を使用します。ルールの背後にある理由を説明します。
- **パターンに焦点を当てる：** ルールは、一回限りのバグ修正ではなく、繰り返し可能なパターン、規約、またはプロジェクトの知識を定義する必要があります。
- **ルールを最新に保つ：** 定期的にルールを見直します。規約が変更されたりコードが進化したりした場合は更新します。時代遅れになったルールや、AI がルールなしでパターンを一貫して従うようになった場合は削除します。
- **AI を信頼する（ある程度）：** ルールはガイダンスを提供しますが、AI にある程度の柔軟性を許可します。特にコードベースが成長するにつれて、既存のコードベースからパターンを推論できることが多いです。

## チームコラボレーション

- **バージョン管理：** `ai/prompts` ディレクトリをリポジトリにコミットし、ルールがコードと一緒に共有およびバージョン管理されるようにします。
- **規約：** ルールの命名、構造化、更新のためのチーム規約を確立します。
- **レビュープロセス：** 重要なルールの変更についてはコードレビューを検討します。
- **オンボーディング：** プロジェクト標準への新しいチームメンバーのオンボーディングを支援するために、ルールを生きたドキュメントとして使用します。
- **共有 vs 個人：** 必要に応じて、命名規約（例：`_personal-*.md`）を確立し、チーム全体のルールと個人の実験的なルールを分離します。

## 完全なルール例

````markdown
# React ファンクショナルコンポーネントの構造

## イントロダクション

このルールは、一貫性、可読性、保守性を確保するために、このプロジェクトにおけるファンクショナル React コンポーネントの標準構造を定義します。型安全性のために TypeScript を使用し、状態と副作用にはフックを優先します。

## パターンの説明

コンポーネントは一般的に以下の順序に従うべきです：

1. `'use client'` ディレクティブ（必要な場合）
2. インポート（React、ライブラリ、内部、型、スタイル）
3. Props インターフェース定義（`ComponentNameProps`）
4. コンポーネント関数定義（`function ComponentName(...)`）
5. ステートフック（`useState`）
6. その他のフック（`useMemo`、`useCallback`、`useEffect`、カスタムフック）
7. ヘルパー関数（外部で定義またはコンポーネント内でメモ化）
8. `useEffect` ブロック
9. return 文（JSX）

```typescript
'use client'; // ブラウザAPIやuseState/useEffectなどのフックが必要な場合のみ

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils'; // 内部ユーティリティの例
import { type VariantProps, cva } from 'class-variance-authority';

// Propsインターフェースを定義
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

// コンポーネントを定義
function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  ...props
}: ButtonProps): React.ReactElement {
  // ステートフック
  const [isMounted, setIsMounted] = useState(false);

  // その他のフック
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading) {
        event.preventDefault();
        return;
      }
      props.onClick?.(event);
    },
    [isLoading, props.onClick]
  );

  // エフェクト
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 条件付きレンダリングロジックはここに配置可能

  // JSXを返す
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

// バリアントの定義例（同じファイルに含めるか、インポートすることも可能）
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        // ... その他のバリアント
      },
      size: {
        default: 'h-10 py-2 px-4',
        // ... その他のサイズ
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export { Button, buttonVariants }; // 名前付きエクスポートを優先
```
````

## 実装手順

1. props に対する明確な`interface`を定義する
2. 状態と副作用には標準的な React フックを使用する
3. コンポーネントは単一の責任に焦点を当てる
4. コンポーネントには名前付きエクスポートを使用する

## 一般的な落とし穴

- `useState`や`useEffect`などのフックを使用する際に`'use client'`を忘れる
- `useCallback`なしでコンポーネント本体に直接ヘルパー関数を定義する（不要な再レンダリングを引き起こす可能性がある）
- 過度に複雑なコンポーネント；分割を検討する
- props や状態に TypeScript を使用していない

````

## 最小限のルールテンプレート

新しいルールの作成時に、これをクイックスタートポイントとして使用してください：

```markdown
# [ルール名]

## イントロダクション / 問題

[このルールが存在する理由と解決する問題]

## パターンの説明

[コード例を含むパターンの説明]

## 実例

- [コードへのリンク]

## 一般的な落とし穴

- [一般的な間違い 1]
- [一般的な間違い 2]
```
````
