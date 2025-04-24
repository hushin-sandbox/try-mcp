import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createUuidServer } from './server.js';
import process from 'node:process';

/**
 * MCPサーバーを初期化して標準入出力にバインドします
 */
async function main() {
  try {
    console.log('UUIDジェネレーターMCPサーバーを起動します...');

    // UUIDサーバーの作成
    const server = createUuidServer();

    // 標準入出力トランスポートの設定
    const transport = new StdioServerTransport();

    // サーバーの接続
    console.log('サーバーを接続中...');
    await server.connect(transport);
    console.log('MCPサーバーが正常に接続されました。要求を待機中...');

    // プロセス終了時の処理
    process.on('SIGINT', async () => {
      console.log('終了シグナルを受信しました。サーバーを停止します...');
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('サーバーの起動中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// サーバーの起動
main().catch((error) => {
  console.error('予期しないエラーが発生しました:', error);
  process.exit(1);
});
