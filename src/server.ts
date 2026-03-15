/**
 * 本地测试服务器
 * 提供 Web 界面和 API 接口用于手工测试
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { getTrending, getTrendingRepositories, getTrendingStatistics } from './index';
import { TrendingFilterOptions } from './types';

const PORT = 34567;

// MIME 类型映射
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 提供静态文件
function serveStaticFile(filePath: string, res: http.ServerResponse): void {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

// 处理 API 请求
async function handleAPIRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API 路由
  if (pathname === '/api/trending') {
    try {
      const options: TrendingFilterOptions = {
        since: (url.searchParams.get('since') as 'daily' | 'weekly' | 'monthly') || 'daily',
        language: url.searchParams.get('language') || undefined,
        spokenLanguageCode: url.searchParams.get('spokenLanguageCode') || undefined
      };

      console.log(`[API] Fetching trending with options:`, options);
      
      const result = await getTrending(options);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error('[API] Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
    return;
  }

  if (pathname === '/api/repositories') {
    try {
      const options: TrendingFilterOptions = {
        since: (url.searchParams.get('since') as 'daily' | 'weekly' | 'monthly') || 'daily',
        language: url.searchParams.get('language') || undefined,
        spokenLanguageCode: url.searchParams.get('spokenLanguageCode') || undefined
      };

      console.log(`[API] Fetching repositories with options:`, options);
      
      const repositories = await getTrendingRepositories(options);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ repositories }));
    } catch (error) {
      console.error('[API] Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
    return;
  }

  if (pathname === '/api/statistics') {
    try {
      const options: TrendingFilterOptions = {
        since: (url.searchParams.get('since') as 'daily' | 'weekly' | 'monthly') || 'daily',
        language: url.searchParams.get('language') || undefined,
        spokenLanguageCode: url.searchParams.get('spokenLanguageCode') || undefined
      };

      console.log(`[API] Fetching statistics with options:`, options);
      
      const stats = await getTrendingStatistics(options);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    } catch (error) {
      console.error('[API] Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
    return;
  }

  // 静态文件服务
  let filePath = pathname === '/' 
    ? path.join(__dirname, '../public/index.html')
    : path.join(__dirname, '../public', pathname);

  // 安全检查：确保文件在 public 目录内
  const publicDir = path.resolve(__dirname, '../public');
  const requestedFile = path.resolve(filePath);
  if (!requestedFile.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  serveStaticFile(filePath, res);
}

// 创建服务器
const server = http.createServer((req, res) => {
  handleAPIRequest(req, res).catch(err => {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     GitHub Trending 提取工具 - 本地测试服务器          ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  🌐 Web 界面: http://localhost:${PORT}/                ║`);
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  📡 API 端点:                                          ║');
  console.log(`║     • GET http://localhost:${PORT}/api/trending        ║`);
  console.log(`║     • GET http://localhost:${PORT}/api/repositories    ║`);
  console.log(`║     • GET http://localhost:${PORT}/api/statistics      ║`);
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  参数:                                                 ║');
  console.log('║     • since=daily|weekly|monthly                       ║');
  console.log('║     • language=python|javascript|...                   ║');
  console.log('║     • spokenLanguageCode=en|zh|...                     ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  按 Ctrl+C 停止服务器                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n👋 正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});
