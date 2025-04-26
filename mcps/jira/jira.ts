import { Version3Client } from "jira.js";
import { Config, JiraClient } from "./types.ts";

export class JiraApiClient implements JiraClient {
  client: Version3Client;

  constructor(config: Config) {
    this.client = new Version3Client({
      host: config.host,
      authentication: {
        basic: {
          email: config.email,
          apiToken: config.token,
        },
      },
    });
  }

  // プロジェクト一覧を取得
  async getProjects() {
    return await this.client.projects.searchProjects();
  }

  // 課題を作成
  async createIssue(
    projectKey: string,
    summary: string,
    description?: string,
    issueType = "Task",
  ) {
    return await this.client.issues.createIssue({
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType },
      },
    });
  }

  // 課題を更新
  async updateIssue(
    issueKey: string,
    { summary, description, status }: {
      summary?: string;
      description?: string;
      status?: string;
    },
  ) {
    const fields: Record<string, unknown> = {};
    if (summary) fields.summary = summary;
    if (description) fields.description = description;
    if (status) fields.status = { name: status };

    return await this.client.issues.editIssue({
      issueIdOrKey: issueKey,
      fields,
    });
  }

  // 課題を検索
  async searchIssues(jql: string, maxResults = 50) {
    return await this.client.issueSearch.searchForIssuesUsingJql({
      jql,
      maxResults,
    });
  }

  // 課題の詳細を取得（親タスク・サブタスク情報を含む）
  async getIssue(issueKey: string) {
    return await this.client.issues.getIssue({
      issueIdOrKey: issueKey,
      fields: ["*all"],
    });
  }

  // コメントを追加
  async addComment(issueKey: string, body: string) {
    return await this.client.issueComments.addComment({
      issueIdOrKey: issueKey,
      comment: body,
    });
  }
}
