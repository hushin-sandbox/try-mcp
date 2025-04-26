import {
  Config,
  Issue,
  IssueType,
  Project,
  RawDescription,
  RawDescriptionContent,
  RawIssue,
  RawIssueType,
  RawProject,
  RawStatus,
  SearchResult,
  Status,
} from "./types.ts";

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
      key: rawProject.key,
      name: rawProject.name,
      url: `${this.baseUrl}/jira/software/projects/${rawProject.key}/summary`,
    };
  }

  async getProjects(): Promise<Project[]> {
    const rawProjects = await this.fetch<RawProject[]>("/rest/api/3/project");
    return rawProjects.map((p) => this.formatProject(p));
  }

  private convertDescriptionToMarkdown(description?: RawDescription): string {
    if (!description?.content) return "";

    const processContent = (
      content: RawDescriptionContent[],
      indent = 0,
    ): string => {
      const spaces = " ".repeat(indent);
      return content.map((node) => {
        switch (node.type) {
          case "heading": {
            const level = node.attrs?.level as number || 1;
            const headingText = node.content
              ? processContent(node.content)
              : "";
            return `${"#".repeat(level)} ${headingText}\n\n`;
          }

          case "paragraph":
            if (!node.content) return "\n";
            return `${spaces}${processContent(node.content)}\n\n`;

          case "text": {
            let text = node.text || "";
            if (node.marks) {
              for (const mark of node.marks) {
                switch (mark.type) {
                  case "strong":
                    text = `**${text}**`;
                    break;
                  case "em":
                    text = `*${text}*`;
                    break;
                  case "strike":
                    text = `~~${text}~~`;
                    break;
                }
              }
            }
            return text;
          }

          case "bulletList":
            return node.content
              ? node.content.map((item) =>
                `${spaces}- ${
                  processContent(item.content || [], indent + 2).trim()
                }`
              ).join("\n") + "\n\n"
              : "";

          case "orderedList":
            return node.content
              ? node.content.map((item, index) =>
                `${spaces}${index + 1}. ${
                  processContent(item.content || [], indent + 2).trim()
                }`
              ).join("\n") + "\n\n"
              : "";

          case "listItem":
            return node.content ? processContent(node.content, indent) : "";

          case "taskList":
            return node.content
              ? node.content.map((item) => {
                const state = item.attrs?.state === "DONE" ? "x" : " ";
                return `${spaces}- [${state}] ${
                  processContent(item.content || [], indent + 2).trim()
                }`;
              }).join("\n") + "\n\n"
              : "";

          case "mention":
            return `${node.attrs?.text || ""}`;

          case "emoji":
            return node.attrs?.text || "";

          default:
            return node.text || "";
        }
      }).join("");
    };

    return processContent(description.content).trim();
  }

  private formatIssue(rawIssue: RawIssue): Issue {
    const formatIssueType = (
      rawType?: RawIssueType,
    ): IssueType | undefined => {
      if (!rawType) return undefined;
      return {
        name: rawType.name,
        description: rawType.description,
        hierarchyLevel: rawType.hierarchyLevel,
      };
    };

    const formatStatus = (rawStatus?: RawStatus): Status | undefined => {
      if (!rawStatus) return undefined;
      return {
        name: rawStatus.name,
        category: rawStatus.statusCategory.key,
      };
    };

    return {
      key: rawIssue.key,
      url: `${this.baseUrl}/browse/${rawIssue.key}`,
      fields: {
        summary: rawIssue.fields.summary,
        description: this.convertDescriptionToMarkdown(
          rawIssue.fields.description,
        ),
        issuetype: formatIssueType(rawIssue.fields.issuetype),
        status: formatStatus(rawIssue.fields.status),
        parent: rawIssue.fields.parent
          ? this.formatIssue(rawIssue.fields.parent)
          : undefined,
      },
    };
  }

  async getIssue(issueKey: string): Promise<Issue> {
    const rawIssue = await this.fetch<RawIssue>(
      `/rest/api/3/issue/${issueKey}`,
    );
    return this.formatIssue(rawIssue);
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
