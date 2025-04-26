# Jira MCP Server

Jira Cloud API を使用して課題管理機能を提供する MCP サーバーです。Jira の課題管理に関する操作を LLM から実行できます。

## 機能

### リソース

- `jira://projects` - プロジェクト一覧の取得
- `jira://issues/{jql}` - JQL を使用した課題の検索
- `jira://issue/{issueKey}` - 課題の詳細情報（親タスク・サブタスク情報を含む）の取得

### ツール

- `create-issue` - 新しい課題を作成
- `update-issue` - 既存の課題を更新
- `search-issues` - JQL を使用して課題を検索
- `add-comment` - 課題にコメントを追加

### プロンプト

- `create-issue-help` - 課題作成の支援プロンプト
- `search-issues-help` - 課題検索の支援プロンプト

## 設定

以下の環境変数を設定する必要があります：

- `JIRA_BASE_URL` - Jira Cloud のベース URL（例：https://your-domain.atlassian.net）
- `JIRA_EMAIL` - Jira Cloud のメールアドレス
- `JIRA_API_TOKEN` - Jira Cloud の API トークン
  - https://id.atlassian.com/manage-profile/security/api-tokens から取得可能
