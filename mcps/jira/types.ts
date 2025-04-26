import { Version3Client } from "jira.js";
import { z } from "zod";

export const ConfigSchema = z.object({
  host: z.string().url(),
  email: z.string().email(),
  token: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

export interface JiraClient {
  client: Version3Client;
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
