#!/usr/bin/env -S deno run -A --ext=ts
import { parseArgs } from "node:util";
import $ from "jsr:@david/dax@0.43.0";

$.setPrintCommand(true);

// 引数のパース
const parsed = parseArgs({
  args: Deno.args,
  options: {
    name: { type: "string" },
  },
  strict: true,
  allowPositionals: true,
});

if (!parsed.values.name) {
  console.error(
    "Usage: deno run -A create-mcp-template.mts --name <mcp-server-name>",
  );
  Deno.exit(1);
}

const mcpName = parsed.values.name;
const targetDir = `mcps/${mcpName}`;

// テンプレートファイルの内容
const denoJsonContent = {
  tasks: {
    dev: "deno run --env -A --watch index.ts",
  },
  imports: {
    "@std/assert": "jsr:@std/assert@1",
    "@std/expect": "jsr:@std/expect@1",
    "@std/testing": "jsr:@std/testing@1",
    "@modelcontextprotocol/sdk": "npm:@modelcontextprotocol/sdk@^1.10.2",
    zod: "npm:zod@^3.24.3",
  },
  lint: {
    rules: {
      exclude: ["require-await"],
    },
  },
};

const indexTsContent =
  `import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.ts";

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  Deno.exit(1);
});
`;

const serverTsContent =
  `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * MCPサーバーの設定と実装
 */
export const createServer = () => {
  const server = new McpServer({
    name: "${mcpName}",
    version: "1.0.0",
    description: "MCPサーバーの説明をここに書く",
  });

  // リソースやツール、プロンプトの追加はここに実装する

  return server;
};
`;

const serverTestTsContent = `import { expect } from "@std/expect";
import { test } from "@std/testing/bdd";
import { createServer } from "./server.ts";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

test("${mcpName}", async () => {
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
    name: "", // TODO 実装したtoolの名前
    arguments: {
      arg1: "Hello, world!", // TODO 書き換え
    },
  }) as CallToolResult;

  expect(result.content[0].type).toBe("text");
  // TODO result.content[0].text のテスト
});
`;

// ディレクトリ作成
await $`mkdir -p ${targetDir}`;

// ファイル作成
await Deno.writeTextFile(
  `${targetDir}/deno.json`,
  JSON.stringify(denoJsonContent, null, 2),
);
await Deno.writeTextFile(`${targetDir}/index.ts`, indexTsContent);
await Deno.writeTextFile(`${targetDir}/server.ts`, serverTsContent);
await Deno.writeTextFile(`${targetDir}/server.test.ts`, serverTestTsContent);

console.log(`✨ Created MCP server template in ${targetDir}`);
console.log("Next steps:");
console.log("1. Edit server.ts to add your resources and tools");
console.log(
  "2. Run 'deno task dev' in the created directory to start development",
);
