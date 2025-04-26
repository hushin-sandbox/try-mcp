import {
  Comment,
  Config,
  Issue,
  JiraClient,
  Project,
  SearchResult,
} from "./types.ts";

export class JiraApiClient implements JiraClient {
  private baseUrl: string;
  private headers: Headers;

  constructor(config: Config) {
    this.baseUrl = `${config.host}/rest/api/3`;
    const auth = btoa(`${config.email}:${config.token}`);
    this.headers = new Headers({
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    });
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Jira API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json() as T;
  }

  async getProjects(): Promise<Project[]> {
    return this.fetch<Project[]>("/project/search");
  }

  async createIssue(
    projectKey: string,
    summary: string,
    description?: string,
    issueType = "Task",
  ): Promise<Issue> {
    return this.fetch<Issue>("/issue", {
      method: "POST",
      body: JSON.stringify({
        fields: {
          project: { key: projectKey },
          summary,
          description,
          issuetype: { name: issueType },
        },
      }),
    });
  }

  async updateIssue(
    issueKey: string,
    { summary, description, status }: {
      summary?: string;
      description?: string;
      status?: string;
    },
  ): Promise<void> {
    const fields: Record<string, unknown> = {};
    if (summary) fields.summary = summary;
    if (description) fields.description = description;
    if (status) fields.status = { name: status };

    await this.fetch(`/issue/${issueKey}`, {
      method: "PUT",
      body: JSON.stringify({ fields }),
    });
  }

  async searchIssues(jql: string, maxResults = 50): Promise<SearchResult> {
    return this.fetch<SearchResult>("/search", {
      method: "POST",
      body: JSON.stringify({
        jql,
        maxResults,
      }),
    });
  }

  async getIssue(issueKey: string): Promise<Issue> {
    return this.fetch<Issue>(`/issue/${issueKey}?fields=*all`);
  }

  async addComment(issueKey: string, body: string): Promise<Comment> {
    return this.fetch<Comment>(`/issue/${issueKey}/comment`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }
}
