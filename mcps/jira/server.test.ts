import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { createServer } from "./server.ts";

const mockConfig = {
  baseUrl: "https://your-domain.atlassian.net",
  email: "test@example.com",
  apiToken: "dummy-token",
};

test("server creates successfully", () => {
  const server = createServer(mockConfig);
  expect(server).toBeDefined();
});
