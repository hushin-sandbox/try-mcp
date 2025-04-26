import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { createServer } from "./server.ts";

const mockConfig = {
  host: "https://your-domain.atlassian.net",
  email: "test@example.com",
  token: "dummy-token",
};

test("server creates successfully", () => {
  const server = createServer(mockConfig);
  expect(server).toBeDefined();
});
