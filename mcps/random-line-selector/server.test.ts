import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { createServer } from "./server.ts";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

test("select_random_line tool should return a random line from the input text", async () => {
  const server = createServer();
  const client = new Client({
    name: "test client",
    version: "1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);

  const inputText = "Line 1\nLine 2\nLine 3\n\nLine 5";
  const expectedLines = ["Line 1", "Line 2", "Line 3", "Line 5"];

  const result = await client.callTool({
    name: "select_random_line",
    arguments: {
      text: inputText,
    },
  }) as CallToolResult;

  expect(result.isError).toBeFalsy();
  expect(result.content[0].type).toBe("text");
  // 型アサーションを調整
  const selectedLine =
    (result.content[0] as { type: "text"; text: string }).text;
  expect(expectedLines).toContain(selectedLine);
});

test("select_random_line tool should return error for empty input", async () => {
  const server = createServer();
  const client = new Client({
    name: "test client",
    version: "1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);

  const result = await client.callTool({
    name: "select_random_line",
    arguments: {
      text: "\n \n", // Input with only whitespace and newlines
    },
  }) as CallToolResult;

  expect(result.isError).toBe(true);
  expect(result.content[0].type).toBe("text");
  // 型アサーションを調整
  expect((result.content[0] as { type: "text"; text: string }).text).toBe(
    "有効な行が見つかりませんでした。",
  );
});
