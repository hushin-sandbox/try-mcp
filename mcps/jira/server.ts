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

  const jiraClient = new JiraApiClient(config);

  server.tool(
    "list-projects",
    "プロジェクト一覧を取得",
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

  server.tool(
    "get-issue",
    "特定の課題の詳細を取得",
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

  server.tool(
    "create-issue",
    "課題作成",
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

  server.tool(
    "update-issue",
    "既存の課題を更新",
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

  server.tool(
    "search-issues",
    "課題検索",
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

  server.tool(
    "add-comment",
    "課題にコメントを追加",
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

  server.tool(
    "help-search-issues",
    "課題検索ツールの使用方法、JQLの例",
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
