import { expect } from "@std/expect";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { Stub, stub } from "@std/testing/mock";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "./server.ts";
import { buildSchema } from "npm:graphql";
import { graphql } from "npm:graphql";
import { getIntrospectionQuery } from "npm:graphql";

describe("GraphQL Schema Traverser", () => {
  let fetchStub: Stub<
    typeof globalThis,
    Parameters<typeof fetch>,
    ReturnType<typeof fetch>
  >;

  beforeEach(async () => {
    const mockSchema = buildSchema(`
      type Query {
        user: User
        post: Post
      }

      type User {
        id: ID!
        name: String!
        posts: [Post!]!
      }

      type Post {
        id: ID!
        title: String!
        author: User!
      }
    `);
    const schemaResult = await graphql({
      schema: mockSchema,
      source: getIntrospectionQuery(),
    });

    const mockResponse = new Response(
      JSON.stringify(schemaResult),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );

    fetchStub = stub(globalThis, "fetch", async () => {
      return mockResponse;
    });
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it("指定された型から辿れる全ての型を抽出できる", async () => {
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
      name: "traverse-schema",
      arguments: {
        endpoint: "http://example.com/graphql",
        typeName: "User",
      },
    }) as CallToolResult;

    expect(result.content[0].type).toBe("text");
    const sdl = (result.content[0] as { type: "text"; text: string }).text;
    expect(sdl).toContain("type User");
    expect(sdl).toContain("type Post");
    expect(sdl).not.toContain("type Query");
  });

  it("存在しない型名を指定した場合にエラーを返す", async () => {
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
      name: "traverse-schema",
      arguments: {
        endpoint: "http://example.com/graphql",
        typeName: "NonExistentType",
      },
    }) as CallToolResult;

    expect(result.isError).toBe(true);
    expect(result.content[0].type).toBe("text");
    expect(
      (result.content[0] as { type: "text"; text: string }).text,
    ).toContain("not found in schema");
  });

  it("無効なエンドポイントの場合にエラーを返す", async () => {
    fetchStub.restore();
    fetchStub = stub(globalThis, "fetch", async () => {
      return new Response(
        JSON.stringify({ errors: [{ message: "Invalid endpoint" }] }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    });

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
      name: "traverse-schema",
      arguments: {
        endpoint: "http://invalid-endpoint",
        typeName: "User",
      },
    }) as CallToolResult;

    expect(result.isError).toBe(true);
    expect(result.content[0].type).toBe("text");
    expect(
      (result.content[0] as { type: "text"; text: string }).text,
    ).toContain("Failed to fetch");
  });
});
