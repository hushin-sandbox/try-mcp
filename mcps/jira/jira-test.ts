// JIRA が動くか動作確認用スクリプト
// deno -A --env jira-test.ts
import { validateConfig } from "./server.ts";

// 環境変数から設定を読み込む
const config = validateConfig({
  baseUrl: Deno.env.get("JIRA_BASE_URL"),
  email: Deno.env.get("JIRA_EMAIL"),
  apiToken: Deno.env.get("JIRA_API_TOKEN"),
});

import { JiraApiClient } from "./jira.ts";

// Jira APIクライアントの初期化
const jiraClient = new JiraApiClient(config);

const projects = await jiraClient.getProjects();
console.log("Projects:", projects);
