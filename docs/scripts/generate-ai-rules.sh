#!/bin/bash

# エラー発生時にスクリプトを停止
set -e

# ルートディレクトリのパスを取得（スクリプトの場所から2階層上）
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# 既存の .clinerules ディレクトリを削除して新規作成
rm -rf "$ROOT_DIR/.clinerules"
mkdir -p "$ROOT_DIR/.clinerules"

# docs/rules 配下の .md ファイルをディレクトリ構造を維持したままコピー
cd "$ROOT_DIR/docs/rules"
find . -type f -name "*.md" -exec cp --parents {} ../../.clinerules/ \;
cd "$ROOT_DIR"

echo "Rules files have been copied to .clinerules directory successfully."

INSTRUCTIONS_FILE="$ROOT_DIR/.vscode/instructions.md"
mkdir -p "$ROOT_DIR/.vscode"
rm -f "$INSTRUCTIONS_FILE" # 既存の instructions.md を削除
# ファイルを basename + path 順にソートして instructions.md に結合
# ファイル名でソートしてから結合
cd "$ROOT_DIR/docs/rules"
find . -type f -name "*.md" | sort -t / -k 3,3 -k 1,2 | while read file; do
  # echo "## $(basename "$file" .md) - $file" >> "$INSTRUCTIONS_FILE"
  cat "$file" >> "$INSTRUCTIONS_FILE"
  echo "" >> "$INSTRUCTIONS_FILE"
done
cd "$ROOT_DIR"

echo "Rules files have been combined to .vscode/instructions.md successfully."


# .cursor/rules ディレクトリを作成
mkdir -p "$ROOT_DIR/.cursor/rules"

# common.mdc を生成
echo "---
description: common rule
globs: 
alwaysApply: true
---

" > "$ROOT_DIR/.cursor/rules/common.mdc"

# frontend.mdc を生成
echo "---
description: Frontend React
globs: **/*.tsx
alwaysApply: false
---

" > "$ROOT_DIR/.cursor/rules/frontend.mdc"

# common ディレクトリのファイルを結合
cd "$ROOT_DIR/docs/rules"
find ./01-common -type f -name "*.md" | sort | while read file; do
  cat "$file" >> "$ROOT_DIR/.cursor/rules/common.mdc"
  echo "" >> "$ROOT_DIR/.cursor/rules/common.mdc"
done

# frontend ディレクトリのファイルを結合
find ./02-frontend -type f -name "*.md" | sort | while read file; do
  cat "$file" >> "$ROOT_DIR/.cursor/rules/frontend.mdc"
  echo "" >> "$ROOT_DIR/.cursor/rules/frontend.mdc"
done

echo "Rules files have been generated in .cursor/rules/ directory successfully."
