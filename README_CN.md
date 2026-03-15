# GitHub Trending Extractor

[中文版本](README_CN.md) | [English Version](README.md)

GitHub Trending 页面内容提取工具，支持多种筛选参数，可封装为 MCP Server 和 WorkBuddy Skill。

## 功能特性

- 抓取 GitHub Trending 页面数据
- 支持多种筛选条件：
  - **时间范围**: 今日(daily)、本周(weekly)、本月(monthly)
  - **编程语言**: Python、JavaScript、TypeScript、Rust、Go、Java 等
  - **开发者口语语言**: English、Chinese、Japanese、French 等
- 提取完整的仓库信息：
  - 仓库名称和链接
  - 仓库描述
  - 编程语言
  - Star/Fork 数量和链接
  - 贡献者列表
  - 今日新增 Stars
- 提供 TypeScript 类型定义
- 支持 MCP Server 模式
- 包含 WorkBuddy Skill 配置

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd github-trending

# 安装依赖
npm install

# 编译 TypeScript
npm run build
```

## 快速开始

### 一键启动 Web 测试界面

我们提供了一个美观的 Web 界面，方便你手工测试和查看数据：

**方式1：使用 npm 脚本**
```bash
npm run server
```

**方式2：使用一键启动脚本（Windows）**
```bash
start-server.bat
```

**方式3：使用一键启动脚本（Linux/Mac）**
```bash
# 先添加执行权限（首次使用）
chmod +x start-server.sh
# 然后运行
./start-server.sh
```

启动后访问：**http://localhost:34567**

界面功能：
- 🔍 可视化筛选条件（时间范围、编程语言、开发者语言）
- 📦 卡片视图展示仓库信息
- 📄 JSON 数据查看
- 📊 实时统计信息

![Web 界面预览](https://via.placeholder.com/800x400/667eea/ffffff?text=GitHub+Trending+Web+UI)

### 运行 MCP Server

```bash
npm run mcp-server
```

## 使用方法

### 作为库使用

```typescript
import { getTrending, getTrendingRepositories, getTrendingStatistics } from './src/index';

// 获取今日所有语言的 Trending
const result = await getTrending();
console.log(result.repositories);

// 获取本周 Python 项目的 Trending
const repos = await getTrendingRepositories({
  since: 'weekly',
  language: 'python'
});

// 获取统计信息
const stats = await getTrendingStatistics({
  since: 'monthly',
  language: 'typescript'
});
```

### 筛选参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `since` | `'daily' \| 'weekly' \| 'monthly'` | 时间范围 | `'weekly'` |
| `language` | `string` | 编程语言 | `'python'`, `'rust'` |
| `spokenLanguageCode` | `string` | 开发者口语语言代码 | `'en'`, `'zh'` |

### 作为 MCP Server 使用

1. 编译项目：
```bash
npm run build
```

2. 配置 MCP 客户端（以 Claude Desktop 为例）：

编辑 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "github-trending": {
      "command": "node",
      "args": ["/path/to/github-trending/dist/mcp-server.js"],
      "description": "GitHub Trending repository scraper"
    }
  }
}
```

3. 可用的 MCP 工具：

- `getTrendingRepositories` - 获取趋势仓库列表
- `getTrendingMetadata` - 获取页面元数据
- `getTrendingStatistics` - 获取统计信息

### 作为 WorkBuddy Skill 使用

将 `skill/SKILL.md` 复制到 WorkBuddy 的 skills 目录：

```bash
# 用户级 Skill
cp skill/SKILL.md ~/.codebuddy/skills/github-trending/

# 项目级 Skill
cp skill/SKILL.md .codebuddy/skills/github-trending/
```

## 数据结构

### TrendingRepository

```typescript
interface TrendingRepository {
  name: string;              // "owner/repo" 格式
  url: string;               // 仓库链接
  description: string;       // 仓库描述
  language: string;          // 编程语言
  stars: number;             // Star 数量（纯整数）
  starsUrl: string;          // Star 页面链接
  forks: number;             // Fork 数量（纯整数）
  forksUrl: string;          // Fork 页面链接
  contributors: Contributor[]; // 贡献者列表
  starsToday: number;        // 今日新增 stars（纯整数）
  starsTodayText: string;    // 原始文本，如 "2,149 stars today"
}

interface Contributor {
  username: string;          // GitHub 用户名
  url: string;               // GitHub 主页链接
  avatar: string;            // 头像 URL
}
```

### TrendingMetadata

```typescript
interface TrendingMetadata {
  title: string;             // 页面标题
  description: string;       // 页面描述
  filterOptions: {
    since: string;           // 当前时间范围
    language?: string;       // 当前编程语言筛选
    spokenLanguageCode?: string; // 当前口语语言筛选
  };
}
```

## 示例

### 获取今日 Python 热门项目

```typescript
import { getTrendingRepositories } from './src/index';

const repos = await getTrendingRepositories({
  since: 'daily',
  language: 'python'
});

repos.forEach(repo => {
  console.log(`${repo.name}: ${repo.stars} stars, +${repo.starsToday} today`);
});
```

### 获取本周中文开发者的 TypeScript 项目

```typescript
const repos = await getTrendingRepositories({
  since: 'weekly',
  language: 'typescript',
  spokenLanguageCode: 'zh'
});
```

### 获取统计信息

```typescript
import { getTrendingStatistics } from './src/index';

const stats = await getTrendingStatistics({ since: 'weekly' });
console.log(`Total repos: ${stats.total}`);
console.log(`Languages:`, stats.languages);
console.log(`Total stars: ${stats.totalStars}`);
```

## 支持的编程语言

- `python` - Python
- `javascript` - JavaScript
- `typescript` - TypeScript
- `rust` - Rust
- `go` - Go
- `java` - Java
- `c` - C
- `c++` - C++
- `c#` - C#
- `ruby` - Ruby
- `php` - PHP
- `swift` - Swift
- `kotlin` - Kotlin
- ... 以及更多

## 支持的口语语言代码

- `en` - English
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- `fr` - French
- `de` - German
- `es` - Spanish
- `ru` - Russian

## 项目结构

```
github-trending/
├── src/
│   ├── types.ts         # TypeScript 类型定义
│   ├── scraper.ts       # 页面抓取模块
│   ├── parser.ts        # HTML 解析模块
│   ├── index.ts         # 主入口，导出 API
│   └── mcp-server.ts    # MCP Server 入口
├── skill/
│   └── SKILL.md         # WorkBuddy Skill 配置
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
└── README.md            # 项目文档
```

## 开发

```bash
# 开发模式
npm run dev

# 启动 Web 测试服务器
npm run server

# 运行 MCP Server
npm run mcp-server

# 编译
npm run build
```

## 项目结构

```
github-trending/
├── src/
│   ├── types.ts         # TypeScript 类型定义
│   ├── scraper.ts       # 页面抓取模块
│   ├── parser.ts        # HTML 解析模块
│   ├── index.ts         # 主入口，导出 API
│   ├── mcp-server.ts    # MCP Server 入口
│   └── server.ts        # Web 测试服务器
├── public/
│   └── index.html       # Web 测试界面
├── skill/
│   └── SKILL.md         # WorkBuddy Skill 配置
├── start-server.bat     # Windows 一键启动脚本
├── start-server.sh      # Linux/Mac 一键启动脚本
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
└── README.md            # 项目文档
```

## 注意事项

1. **反爬机制**: 本工具设置了合理的 User-Agent 和请求头，但频繁请求可能会被 GitHub 限制
2. **数据更新**: GitHub Trending 数据会定期更新，不是实时数据
3. **页面结构**: 如果 GitHub 页面结构发生变化，可能需要更新解析逻辑
4. **网络问题**: 国内访问 GitHub 可能需要配置代理

## 许可证

Apache 2.0

## 贡献

欢迎提交 Issue 和 Pull Request！
