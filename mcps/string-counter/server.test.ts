import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { createServer } from "./server.ts";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

test("string-counter", async () => {
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
    name: "count-string",
    arguments: {
      text: "Hello, world!",
    },
  });

  const toolResult = result as CallToolResult;
  expect(toolResult.content[0].type).toBe("text");
  expect((toolResult.content[0] as { type: "text"; text: string }).text).toBe(
    "13",
  );
});
