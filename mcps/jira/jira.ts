import { Config, Issue, Project, RawProject, SearchResult } from "./types.ts";

export class JiraApiClient {
  private baseUrl: string;
  private email: string;
  private apiToken: string;
  private auth: string;

  constructor(config: Config) {
    this.baseUrl = config.baseUrl;
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.auth = btoa(`${this.email}:${this.apiToken}`);
  }

  private async fetch<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = new URL(path, this.baseUrl).toString();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Basic ${this.auth}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jira API error: ${response.status} ${error}`);
    }

    return response.json() as Promise<T>;
  }

  private formatProject(rawProject: RawProject): Project {
    return {
      id: rawProject.id,
      key: rawProject.key,
      name: rawProject.name,
      url: `${this.baseUrl}/jira/software/projects/${rawProject.key}/summary`,
    };
  }

  async getProjects(): Promise<Project[]> {
    const rawProjects = await this.fetch<RawProject[]>("/rest/api/3/project");
    return rawProjects.map((p) => this.formatProject(p));
  }

  async getIssue(issueKey: string): Promise<Issue> {
    return this.fetch<Issue>(`/rest/api/3/issue/${issueKey}`);
  }

  async createIssue(
    projectKey: string,
    summary: string,
    description?: string,
    issueType = "Task",
  ): Promise<{ id: string; key: string }> {
    return this.fetch<{ id: string; key: string }>(
      "/rest/api/3/issue",
      {
        method: "POST",
        body: JSON.stringify({
          fields: {
            project: { key: projectKey },
            summary,
            description,
            issuetype: { name: issueType },
          },
        }),
      },
    );
  }

  async updateIssue(
    issueKey: string,
    fields: {
      summary?: string;
      description?: string;
      status?: string;
    },
  ): Promise<void> {
    const body: {
      fields: {
        summary?: string;
        description?: string;
        status?: { name: string };
      };
    } = { fields: {} };

    if (fields.summary) {
      body.fields.summary = fields.summary;
    }
    if (fields.description) {
      body.fields.description = fields.description;
    }
    if (fields.status) {
      body.fields.status = { name: fields.status };
    }

    await this.fetch(
      `/rest/api/3/issue/${issueKey}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    );
  }

  async searchIssues(jql: string, maxResults = 50): Promise<SearchResult> {
    return this.fetch<SearchResult>(
      "/rest/api/3/search",
      {
        method: "POST",
        body: JSON.stringify({
          jql,
          maxResults,
          fields: ["summary", "description", "status"],
        }),
      },
    );
  }

  async addComment(issueKey: string, body: string): Promise<void> {
    await this.fetch(
      `/rest/api/3/issue/${issueKey}/comment`,
      {
        method: "POST",
        body: JSON.stringify({ body }),
      },
    );
  }
}
