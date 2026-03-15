/**
 * MCP Server entry point
 * Wraps GitHub Trending extractor as MCP Server for AI assistant calls
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  TextContent
} from '@modelcontextprotocol/sdk/types.js';
import { getTrending, getTrendingRepositories, getTrendingMetadata, getTrendingStatistics } from './index';
import { TrendingFilterOptions, TimeRange } from './types';

/**
 * 可用的工具列表
 */
const TOOLS: Tool[] = [
  {
    name: 'getTrendingRepositories',
    description: 'Get GitHub Trending repository list. Can filter by time range, programming language, and developer spoken language.',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'Time range: daily (today), weekly (this week), monthly (this month)',
          default: 'daily'
        },
        language: {
          type: 'string',
          description: 'Programming language filter, e.g.: python, javascript, typescript, rust, go, java, c, c++, c#',
        },
        spokenLanguageCode: {
          type: 'string',
          description: 'Developer spoken language code, e.g.: en (English), zh (Chinese), ja (Japanese), fr (French)'
        }
      }
    }
  },
  {
    name: 'getTrendingMetadata',
    description: 'Get GitHub Trending page metadata, including page title, description, and current applied filters.',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'Time range',
          default: 'daily'
        },
        language: {
          type: 'string',
          description: 'Programming language filter'
        },
        spokenLanguageCode: {
          type: 'string',
          description: 'Developer spoken language code'
        }
      }
    }
  },
  {
    name: 'getTrendingStatistics',
    description: 'Get GitHub Trending statistics, including total repositories, language distribution, total stars and forks.',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'Time range',
          default: 'daily'
        },
        language: {
          type: 'string',
          description: 'Programming language filter'
        },
        spokenLanguageCode: {
          type: 'string',
          description: 'Developer spoken language code'
        }
      }
    }
  }
];

/**
 * 创建 MCP Server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'github-trending-server',
      version: '0.1.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 处理工具列表请求
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS
    };
  });

  // 处理工具调用请求
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      // 构建筛选选项
      const options: TrendingFilterOptions = {};
      if (args?.since) {
        options.since = args.since as TimeRange;
      }
      if (args?.language) {
        options.language = String(args.language);
      }
      if (args?.spokenLanguageCode) {
        options.spokenLanguageCode = String(args.spokenLanguageCode);
      }

      let result: unknown;

      switch (name) {
        case 'getTrendingRepositories': {
          const repositories = await getTrendingRepositories(options);
          result = {
            count: repositories.length,
            repositories: repositories.map(repo => ({
              name: repo.name,
              url: repo.url,
              description: repo.description,
              language: repo.language,
              stars: repo.stars,
              starsUrl: repo.starsUrl,
              forks: repo.forks,
              forksUrl: repo.forksUrl,
              starsToday: repo.starsToday,
              starsTodayText: repo.starsTodayText,
              contributors: repo.contributors.map(c => ({
                username: c.username,
                url: c.url
              }))
            }))
          };
          break;
        }

        case 'getTrendingMetadata': {
          const metadata = await getTrendingMetadata(options);
          result = metadata;
          break;
        }

        case 'getTrendingStatistics': {
          const stats = await getTrendingStatistics(options);
          result = stats;
          break;
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      // Return result
      const content: TextContent[] = [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ];

      return {
        content,
        isError: false
      };
    } catch (error) {
      // 处理错误
      const errorMessage = error instanceof Error ? error.message : String(error);
      const content: TextContent[] = [
        {
          type: 'text',
          text: JSON.stringify({
            error: true,
            message: errorMessage
          }, null, 2)
        }
      ];

      return {
        content,
        isError: true
      };
    }
  });

  return server;
}

/**
 * 启动 MCP Server
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  console.error('GitHub Trending MCP Server starting...');
  console.error('Available tools:', TOOLS.map(t => t.name).join(', '));

  await server.connect(transport);

  console.error('GitHub Trending MCP Server connected');
}

// Start server
main().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

export { createServer };
