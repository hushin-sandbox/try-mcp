import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
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

  // プロジェクト一覧リソース
  server.resource(
    "projects",
    "jira://projects",
    async (uri) => {
      try {
        const projects = await jiraClient.getProjects();
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 課題リソース (検索結果)
  server.resource(
    "issues",
    new ResourceTemplate("jira://issues/{jql}", { list: undefined }),
    async (uri, params) => {
      try {
        const jql = decodeURIComponent(params.jql as string);
        const issues = await jiraClient.searchIssues(jql);
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(issues, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 課題詳細リソース
  server.resource(
    "issue",
    new ResourceTemplate("jira://issue/{issueKey}", { list: undefined }),
    async (uri, params) => {
      try {
        const issue = await jiraClient.getIssue(params.issueKey as string);
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          contents: [
            {
              uri: uri.href,
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

  // プロンプト：課題作成支援
  server.prompt(
    "create-issue-help",
    {},
    async () => ({
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text:
              "Jira課題の作成を支援します。以下の情報を含めて説明してください：\n" +
              "1. プロジェクトキー\n" +
              "2. 課題のタイトル\n" +
              "3. 課題の説明\n" +
              "4. 課題タイプ（Task, Bug, Story など）",
          },
        },
      ],
    }),
  );

  // プロンプト：課題検索支援
  server.prompt(
    "search-issues-help",
    {},
    async () => ({
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text:
              "Jira課題の検索を支援します。以下の条件を含めて説明してください：\n" +
              "1. プロジェクト\n" +
              "2. ステータス\n" +
              "3. 優先度\n" +
              "4. アサイン状況\n" +
              "5. その他の条件",
          },
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
