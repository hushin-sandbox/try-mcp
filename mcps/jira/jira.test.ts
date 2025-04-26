// filepath: /home/bmk/ghq/github.com/example-sandbox/try-mcp/mcps/jira/jira.test.ts
import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { JiraApiClient } from "./jira.ts";
import { RawProject } from "./types.ts";

test("getProjects formats project data correctly", () => {
  const client = new JiraApiClient({
    baseUrl: "https://example.atlassian.net",
    email: "test@example.com",
    apiToken: "dummy-token",
  });

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
