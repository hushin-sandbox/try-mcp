import { z } from "zod";

export const ConfigSchema = z.object({
  host: z.string().url(),
  email: z.string().email(),
  token: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

// Basic認証用のヘッダーを生成する型
export interface BasicAuth {
  email: string;
  apiToken: string;
}

// API Response Types
export interface Project {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
}

export interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status?: {
      name: string;
    };
    project: {
      key: string;
    };
    issuetype: {
      name: string;
    };
  };
}

export interface Comment {
  id: string;
  body: string;
  author: {
    displayName: string;
    emailAddress: string;
  };
  created: string;
  updated: string;
}

export interface SearchResult {
  total: number;
  issues: Issue[];
}

export interface JiraClient {
  getProjects(): Promise<Project[]>;
  createIssue(
    projectKey: string,
    summary: string,
    description?: string,
    issueType?: string,
  ): Promise<Issue>;
  updateIssue(
    issueKey: string,
    updates: {
      summary?: string;
      description?: string;
      status?: string;
    },
  ): Promise<void>;
  searchIssues(jql: string, maxResults?: number): Promise<SearchResult>;
  getIssue(issueKey: string): Promise<Issue>;
  addComment(issueKey: string, body: string): Promise<Comment>;
}

// Issue関連の型定義
export const IssueCreateSchema = z.object({
  projectKey: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  issueType: z.string(),
});

export const IssueUpdateSchema = z.object({
  issueKey: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

export const IssueSearchSchema = z.object({
  jql: z.string(),
  maxResults: z.number().min(1).max(100).default(50),
});

export const CommentAddSchema = z.object({
  issueKey: z.string(),
  body: z.string(),
});
