import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { createServer } from "./server.ts";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { validate } from "@std/uuid";

test("generate-uuid should return a valid UUID v4", async () => {
  const mcpServer = createServer();
  const client = new Client({
    name: "test client",
    version: "1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  await Promise.all([
    client.connect(clientTransport),
    mcpServer.server.connect(serverTransport),
  ]);

  const result = await client.request(
    {
      method: "tools/call",
      params: {
        name: "generate-uuid",
      },
    },
    CallToolResultSchema,
  );

  expect(result.content[0].type).toBe("text");
  const uuid = result.content[0].text;
  expect(validate(uuid as string)).toBe(true);
});
