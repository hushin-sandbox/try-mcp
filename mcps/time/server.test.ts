import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { createServer } from "./server.ts";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

test("time", async () => {
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
    name: "get_current_time", // ツール名を指定
    arguments: {}, // 引数なし
  });

  const toolResult = result as CallToolResult;
  expect(toolResult.content[0].type).toBe("text");
  // 返されたテキストがISO 8601形式のタイムスタンプであることを確認
  const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  expect(toolResult.content[0].text).toMatch(timestampRegex);
});
