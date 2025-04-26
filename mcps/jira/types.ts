import { z } from "zod";

// 設定スキーマ
export const ConfigSchema = z.object({
  baseUrl: z.string().url(),
  email: z.string().email(),
  apiToken: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

// 課題作成スキーマ
export const IssueCreateSchema = z.object({
  projectKey: z.string().describe("Jiraプロジェクトキー"),
  summary: z.string().describe("課題のタイトル"),
  description: z.string().optional().describe("課題の説明（オプション）"),
  issueType: z.string().describe("課題タイプ（Task, Bug, Story など）"),
});

export type IssueCreate = z.infer<typeof IssueCreateSchema>;

// 課題更新スキーマ
export const IssueUpdateSchema = z.object({
  issueKey: z.string().describe("更新する課題のキー"),
  summary: z.string().optional().describe("課題のタイトル（オプション）"),
  description: z.string().optional().describe("課題の説明（オプション）"),
  status: z.string().optional().describe("課題のステータス（オプション）"),
});

export type IssueUpdate = z.infer<typeof IssueUpdateSchema>;

// 課題検索スキーマ
export const IssueSearchSchema = z.object({
  jql: z.string().describe("JQL検索クエリ"),
  maxResults: z.number().optional().default(50).describe(
    "最大結果数（デフォルト: 50）",
  ),
});

export type IssueSearch = z.infer<typeof IssueSearchSchema>;

// コメント追加スキーマ
export const CommentAddSchema = z.object({
  issueKey: z.string().describe("コメントを追加する課題のキー"),
  body: z.string().describe("コメントの本文"),
});

export type CommentAdd = z.infer<typeof CommentAddSchema>;

// Raw API Response type
export interface RawProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  self: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  properties: Record<string, unknown>;
  entityId: string;
  uuid: string;
}

// Formatted Project type
export interface Project {
  id: string;
  key: string;
  name: string;
  url: string;
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
  };
}

export interface SearchResult {
  issues: Issue[];
  total: number;
}
