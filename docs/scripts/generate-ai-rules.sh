#!/bin/bash

# エラー発生時にスクリプトを停止
set -e

# ルートディレクトリのパスを取得（スクリプトの場所から2階層上）
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# Markdownファイルからコメントを削除する関数
remove_markdown_comments() {
  if [ $# -eq 2 ]; then
    # ファイル間のコピーモード（入力ファイル → 出力ファイル）
    local input_file="$1"
    local output_file="$2"
    perl -0777 -pe 's/<!--.*?-->//gs' "$input_file" > "$output_file"
  elif [ $# -eq 1 ]; then
    # ファイルから標準出力へのモード（入力ファイル → 標準出力）
    perl -0777 -pe 's/<!--.*?-->//gs' "$1"
  else
    # 標準入力から標準出力へのモード（パイプライン処理）
    perl -0777 -pe 's/<!--.*?-->//gs'
  fi
}

# 既存の .clinerules ディレクトリを削除して新規作成
rm -rf "$ROOT_DIR/.clinerules"
mkdir -p "$ROOT_DIR/.clinerules"

# docs/rules 配下の .md ファイルをディレクトリ構造を維持したままコピーし、コメントを削除
cd "$ROOT_DIR/docs/rules"
find . -type f -name "*.md" | while read file; do
  # 親ディレクトリを作成
  mkdir -p "$(dirname "../../.clinerules/$file")"
  # コメントを削除してコピー
  remove_markdown_comments "$file" "../../.clinerules/$file"
done
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
  # コメントを削除して結合
  remove_markdown_comments "$file" | cat >> "$INSTRUCTIONS_FILE"
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

# common ディレクトリのファイルを結合
cd "$ROOT_DIR/docs/rules"
find ./01-common -type f -name "*.md" | sort | while read file; do
  # コメントを削除して結合
  remove_markdown_comments "$file" | cat >> "$ROOT_DIR/.cursor/rules/common.mdc"
  echo "" >> "$ROOT_DIR/.cursor/rules/common.mdc"
done

echo "Rules files have been generated in .cursor/rules/ directory successfully."
