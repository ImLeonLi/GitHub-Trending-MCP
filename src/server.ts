/**
 * Local test server
 * Provides web interface and API endpoints for manual testing
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

// Start server
server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     GitHub Trending Extractor - Local Test Server      ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  🌐 Web Interface: http://localhost:${PORT}/             ║`);
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  📡 API Endpoints:                                     ║');
  console.log(`║     • GET http://localhost:${PORT}/api/trending          ║`);
  console.log(`║     • GET http://localhost:${PORT}/api/repositories      ║`);
  console.log(`║     • GET http://localhost:${PORT}/api/statistics        ║`);
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  Parameters:                                           ║');
  console.log('║     • since=daily|weekly|monthly                       ║');
  console.log('║     • language=python|javascript|...                   ║');
  console.log('║     • spokenLanguageCode=en|zh|...                     ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  Press Ctrl+C to stop the server                       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
