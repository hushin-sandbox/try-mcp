import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { createServer } from "./server.ts";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

test("string-reverser", async () => {
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

  const testCases = [
    { input: "Hello, world!", expected: "!dlrow ,olleH" },
    { input: "", expected: "" },
    { input: "こんにちは", expected: "はちにんこ" },
    { input: "👋🌍", expected: "🌍👋" },
    { input: "A", expected: "A" },
  ];

  for (const { input, expected } of testCases) {
    const result = await client.callTool({
      name: "reverse",
      arguments: {
        text: input,
      },
    });

    const toolResult = result as CallToolResult;
    expect(toolResult.content[0].type).toBe("text");
    expect(toolResult.content[0].text).toBe(expected);
  }
});
