/**
 * MCP Server 入口
 * 将 GitHub Trending 提取器封装为 MCP Server，供 AI 助手调用
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
    description: '获取 GitHub Trending 仓库列表。可以按时间范围、编程语言和开发者口语语言进行筛选。',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: '时间范围：daily（今日）、weekly（本周）、monthly（本月）',
          default: 'daily'
        },
        language: {
          type: 'string',
          description: '编程语言筛选，例如：python, javascript, typescript, rust, go, java, c, c++, c#'
        },
        spokenLanguageCode: {
          type: 'string',
          description: '开发者口语语言代码，例如：en（English）、zh（Chinese）、ja（Japanese）、fr（French）'
        }
      }
    }
  },
  {
    name: 'getTrendingMetadata',
    description: '获取 GitHub Trending 页面元数据，包括页面标题、描述和当前应用的筛选条件。',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: '时间范围',
          default: 'daily'
        },
        language: {
          type: 'string',
          description: '编程语言筛选'
        },
        spokenLanguageCode: {
          type: 'string',
          description: '开发者口语语言代码'
        }
      }
    }
  },
  {
    name: 'getTrendingStatistics',
    description: '获取 GitHub Trending 统计信息，包括仓库总数、语言分布、总 stars 和 forks。',
    inputSchema: {
      type: 'object',
      properties: {
        since: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: '时间范围',
          default: 'daily'
        },
        language: {
          type: 'string',
          description: '编程语言筛选'
        },
        spokenLanguageCode: {
          type: 'string',
          description: '开发者口语语言代码'
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
      version: '1.0.0'
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
          throw new Error(`未知工具: ${name}`);
      }

      // 返回结果
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

  console.error('GitHub Trending MCP Server 正在启动...');
  console.error('可用工具:', TOOLS.map(t => t.name).join(', '));

  await server.connect(transport);

  console.error('GitHub Trending MCP Server 已连接');
}

// 启动服务器
main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});

export { createServer };
