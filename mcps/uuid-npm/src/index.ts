import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createUuidServer } from './server.js';
import process from 'node:process';

async function main() {
  const server = createUuidServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
