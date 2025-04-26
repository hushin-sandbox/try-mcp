import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JiraApiClient } from "./jira.ts";
import {
  CommentAddSchema,
  Config,
  ConfigSchema,
  IssueCreateSchema,
  IssueSearchSchema,
  IssueUpdateSchema,
} from "./types.ts";

export const createServer = (config: Config) => {
  const server = new McpServer({
    name: "Jira",
    version: "1.0.0",
  });

  // Jira APIクライアントの初期化
  const jiraClient = new JiraApiClient(config);

  // プロジェクト一覧取得ツール
  server.tool(
    "list-projects",
    {},
    async () => {
      try {
        const projects = await jiraClient.getProjects();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 課題取得ツール
  server.tool(
    "get-issue",
    { issueKey: z.string() },
    async (args) => {
      try {
        const issue = await jiraClient.getIssue(args.issueKey);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 課題作成ツール
  server.tool(
    "create-issue",
    IssueCreateSchema.shape,
    async (args, _extra) => {
      try {
        const { projectKey, summary, description, issueType } = args;
        const issue = await jiraClient.createIssue(
          projectKey,
          summary,
          description,
          issueType,
        );
        return {
          content: [
            {
              type: "text",
              text: `Issue created: ${issue.key}`,
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 課題更新ツール
  server.tool(
    "update-issue",
    IssueUpdateSchema.shape,
    async (args, _extra) => {
      try {
        const { issueKey, summary, description, status } = args;
        await jiraClient.updateIssue(issueKey, {
          summary,
          description,
          status,
        });
        return {
          content: [
            {
              type: "text",
              text: `Issue ${issueKey} updated successfully`,
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 課題検索ツール
  server.tool(
    "search-issues",
    IssueSearchSchema.shape,
    async (args, _extra) => {
      try {
        const { jql, maxResults } = args;
        const results = await jiraClient.searchIssues(jql, maxResults);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // コメント追加ツール
  server.tool(
    "add-comment",
    CommentAddSchema.shape,
    async (args, _extra) => {
      try {
        const { issueKey, body } = args;
        await jiraClient.addComment(issueKey, body);
        return {
          content: [
            {
              type: "text",
              text: `Comment added to issue ${issueKey}`,
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ヘルプツール
  server.tool(
    "help",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: "使用可能なツール:\n\n" +
            "1. list-projects: プロジェクト一覧を取得\n" +
            "2. get-issue: 特定の課題の詳細を取得\n" +
            "3. create-issue: 新しい課題を作成\n" +
            "4. update-issue: 既存の課題を更新\n" +
            "5. search-issues: JQLを使用して課題を検索\n" +
            "6. add-comment: 課題にコメントを追加\n\n" +
            "各ツールの使用方法については、個別のヘルプメッセージを参照してください。",
        },
      ],
    }),
  );

  // 課題作成ヘルプツール
  server.tool(
    "help-create-issue",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: "課題作成ツールの使用方法:\n\n" +
            "必要なパラメータ:\n" +
            "1. projectKey: プロジェクトキー\n" +
            "2. summary: 課題のタイトル\n" +
            "3. description: 課題の説明（オプション）\n" +
            "4. issueType: 課題タイプ（Task, Bug, Story など）\n\n" +
            "例:\n" +
            '{"projectKey": "PROJ", "summary": "新機能の実装", "issueType": "Task", "description": "詳細な説明をここに記述"}',
        },
      ],
    }),
  );

  // 課題検索ヘルプツール
  server.tool(
    "help-search-issues",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: "課題検索ツールの使用方法:\n\n" +
            "必要なパラメータ:\n" +
            "1. jql: JQL検索クエリ\n" +
            "2. maxResults: 取得する最大結果数（オプション、デフォルト: 50）\n\n" +
            "JQLの例:\n" +
            '- project = "PROJ"\n' +
            '- project = "PROJ" AND status = "Open"\n' +
            '- project = "PROJ" AND priority = High AND assignee = currentUser()',
        },
      ],
    }),
  );

  return server;
};

// 設定のバリデーション関数
export function validateConfig(config: unknown): Config {
  return ConfigSchema.parse(config);
}
