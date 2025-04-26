import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { JiraApiClient } from "./jira.ts";
import { RawDescription, RawIssue } from "./types.ts";
import { RawProject } from "./types.ts";

const client = new JiraApiClient({
  baseUrl: "https://example.atlassian.net",
  email: "test@example.com",
  apiToken: "dummy-token",
});

test("getProjects formats project data correctly", () => {
  const mockRawProject: RawProject = {
    id: "10000",
    key: "SMP",
    name: "Sample Project",
    projectTypeKey: "software",
    self: "https://example.atlassian.net/rest/api/3/project/10000",
    simplified: true,
    style: "next-gen",
    isPrivate: false,
    properties: {},
    entityId: "bd030056-b32b-436b-8d04-40c5cd81adfb",
    uuid: "bd030056-b32b-436b-8d04-40c5cd81adfb",
  };

  // @ts-ignore: テスト用にprivateメソッドにアクセス
  const formattedProject = client.formatProject(mockRawProject);

  expect(formattedProject).toEqual({
    id: "10000",
    key: "SMP",
    name: "Sample Project",
    url: "https://example.atlassian.net/jira/software/projects/SMP/summary",
  });
});

test("converts Jira description to Markdown", () => {
  const rawDescription: RawDescription = {
    type: "doc",
    version: 1,
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "見出し1" }],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "見出し2" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "mention",
            attrs: {
              id: "user1",
              text: "@Atlas for Jira Cloud",
            },
          },
          { type: "text", text: " mention" },
        ],
      },
      {
        type: "taskList",
        content: [
          {
            type: "taskItem",
            content: [{ type: "text", text: "todo" }],
            attrs: { state: "TODO" },
          },
          {
            type: "taskItem",
            content: [{ type: "text", text: "done" }],
            attrs: { state: "DONE" },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "本文中に" },
          {
            type: "text",
            text: "太字とか ",
            marks: [{ type: "strong" }],
          },
          { type: "text", text: "aaa " },
          {
            type: "text",
            text: "italic",
            marks: [{ type: "em" }],
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "list" }],
              },
              {
                type: "bulletList",
                content: [
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "nested list" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "first" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "second" }],
              },
            ],
          },
        ],
      },
    ],
  };

  // @ts-ignore: テスト用にprivateメソッドにアクセス
  const markdown = client.convertDescriptionToMarkdown(rawDescription);

  const expected = `# 見出し1

## 見出し2

@Atlas for Jira Cloud mention

- [ ] todo
- [x] done

本文中に**太字とか **aaa *italic*

- list
  - nested list

1. first
2. second`;

  expect(markdown).toBe(expected);
});

test("formats Issue with parent", () => {
  const rawIssue: RawIssue = {
    id: "10005",
    key: "SMP-6",
    self: "https://example.atlassian.net/rest/api/3/issue/10005",
    fields: {
      summary: "サンプル タスク 4",
      issuetype: {
        id: "10001",
        name: "タスク",
        description: "さまざまな小規模作業。",
        hierarchyLevel: 0,
      },
      status: {
        name: "To Do",
        id: "10000",
        statusCategory: {
          key: "new",
          name: "To Do",
        },
      },
      parent: {
        id: "10000",
        key: "SMP-1",
        self: "https://example.atlassian.net/rest/api/3/issue/10000",
        fields: {
          summary: "サンプル エピック 2",
          issuetype: {
            id: "10002",
            name: "エピック",
            description: "一連の関連するバグ、ストーリー、タスクを追跡します。",
            hierarchyLevel: 1,
          },
        },
      },
    },
  };

  // @ts-ignore: テスト用にprivateメソッドにアクセス
  const formattedIssue = client.formatIssue(rawIssue);

  expect(formattedIssue).toEqual({
    id: "10005",
    key: "SMP-6",
    url: "https://example.atlassian.net/browse/SMP-6",
    fields: {
      summary: "サンプル タスク 4",
      description: "",
      issuetype: {
        id: "10001",
        name: "タスク",
        description: "さまざまな小規模作業。",
        hierarchyLevel: 0,
      },
      status: {
        name: "To Do",
        category: "new",
      },
      parent: {
        id: "10000",
        key: "SMP-1",
        url: "https://example.atlassian.net/browse/SMP-1",
        fields: {
          summary: "サンプル エピック 2",
          description: "",
          issuetype: {
            id: "10002",
            name: "エピック",
            description: "一連の関連するバグ、ストーリー、タスクを追跡します。",
            hierarchyLevel: 1,
          },
        },
      },
    },
  });
});
