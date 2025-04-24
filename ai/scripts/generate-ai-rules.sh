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
    perl -0777 -pe 's/<!--.*?-->//gs' "$input_file" >"$output_file"
  elif [ $# -eq 1 ]; then
    # ファイルから標準出力へのモード（入力ファイル → 標準出力）
    perl -0777 -pe 's/<!--.*?-->//gs' "$1"
  else
    # 標準入力から標準出力へのモード（パイプライン処理）
    perl -0777 -pe 's/<!--.*?-->//gs'
  fi
}

# .clinerules ディレクトリにルールファイルを作成
rm -rf "$ROOT_DIR/.clinerules"
mkdir -p "$ROOT_DIR/.clinerules"

# ai/rules 配下の .md ファイルをディレクトリ構造を維持したままコピーし、コメントを削除
cd "$ROOT_DIR/ai/rules"
find . -type f -name "*.md" | while read file; do
  # 親ディレクトリを作成
  mkdir -p "$(dirname "../../.clinerules/$file")"
  # コメントを削除してコピー
  remove_markdown_comments "$file" "../../.clinerules/$file"
done
cd "$ROOT_DIR"

echo "Rules files have been copied to .clinerules directory successfully."

# .vscode/instructions.md を生成
INSTRUCTIONS_FILE="$ROOT_DIR/.vscode/instructions.md"
mkdir -p "$ROOT_DIR/.vscode"
rm -f "$INSTRUCTIONS_FILE"
cd "$ROOT_DIR/ai/rules"
# ファイルを basename + path 順にソートして instructions.md に結合
find . -type f -name "*.md" | sort -t / -k 3,3 -k 1,2 | while read file; do
  # echo "## $(basename "$file" .md) - $file" >> "$INSTRUCTIONS_FILE"
  # コメントを削除して結合
  remove_markdown_comments "$file" | cat >>"$INSTRUCTIONS_FILE"
  echo "" >>"$INSTRUCTIONS_FILE"
done
cd "$ROOT_DIR"

echo "Rules files have been combined to .vscode/instructions.md successfully."

# .cursor/rules ディレクトリを作成
CURSOR_RULES_DIR="$ROOT_DIR/.cursor/rules"
rm -rf "$CURSOR_RULES_DIR"
mkdir -p "$CURSOR_RULES_DIR"

# MDCファイルを生成する関数
generate_mdc_file() {
  local output_file=$1
  local description=$2
  local globs=$3
  local always_apply=$4
  local rules_dir=$5

  # ヘッダーの生成
  cat >"$output_file" <<EOF
---
description: $description
globs: $globs
alwaysApply: $always_apply
---

EOF

  # コンテンツの追加
  find "$rules_dir" -type f -name "*.md" | sort | while read -r file; do
    remove_markdown_comments "$file" | cat >>"$output_file"
    echo -e "\n" >>"$output_file" # Use echo -e for newline interpretation
  done
}

# common.mdc を生成
cd "$ROOT_DIR/ai/rules"
generate_mdc_file "$CURSOR_RULES_DIR/common.mdc" "common rule" "" "true" "./01-common"

# frontend.mdc を生成
generate_mdc_file "$CURSOR_RULES_DIR/frontend.mdc" "Frontend React" "*.tsx,*.ts" "false" "./02-frontend"
cd "$ROOT_DIR"

# プロンプトファイルをMDCファイルに変換する関数
generate_prompt_mdc() {
  local input_dir="ai/prompts"
  local output_root_dir=".cursor/rules"

  find "$input_dir" -type f -name "*.prompt.md" | while read -r file; do
    local basename=$(basename "$file" .prompt.md)
    local mdc_name="${basename}.mdc"

    # 各ディレクトリにMDCファイルを生成
    for output_dir in "$output_root_dir"; do
      cat >"${output_dir}/${mdc_name}" <<EOF
---
description:
globs:
alwaysApply: false
---

EOF
      remove_markdown_comments "$file" | cat >>"${output_dir}/${mdc_name}"
      echo -e "\n" >>"${output_dir}/${mdc_name}"
    done
  done
}

# プロンプトファイルからMDCファイルを生成
generate_prompt_mdc

echo "Rules files have been generated in .cursor/rules/ directory successfully."
