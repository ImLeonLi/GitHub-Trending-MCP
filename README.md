# GitHub Trending Extractor

[中文版本](README_CN.md) | [English Version](README.md)

A powerful tool for scraping GitHub Trending repositories with multiple filter options. Supports MCP Server and WorkBuddy Skill integration.

## Features

- Scrape GitHub Trending page data
- Multiple filter options:
  - **Time Range**: daily, weekly, monthly
  - **Programming Language**: Python, JavaScript, TypeScript, Rust, Go, Java, etc.
  - **Spoken Language**: English, Chinese, Japanese, French, etc.
- Complete repository information:
  - Repository name and URL
  - Description
  - Programming language
  - Star/Fork counts and URLs
  - Contributor list with avatars
  - Stars gained today
- Full TypeScript support
- MCP Server mode for AI assistants
- WorkBuddy Skill configuration

## Quick Start

### One-Click Web Interface

We provide a beautiful web interface for manual testing:

**Option 1: Use npm script**
```bash
npm run server
```

**Option 2: Use startup script (Windows)**
```bash
start-server.bat
```

**Option 3: Use startup script (Linux/Mac)**
```bash
# Add execute permission (first time only)
chmod +x start-server.sh
# Run the script
./start-server.sh
```

Then open: **http://localhost:34567**

Interface features:
- 🔍 Visual filter options (time range, programming language, spoken language)
- 📦 Card view for repository display
- 📄 JSON data viewer
- 📊 Real-time statistics

### Run MCP Server

```bash
npm run mcp-server
```

## Installation

```bash
# Clone the repository
git clone https://github.com/ImLeonLi/GitHub-Trending-MCP.git
cd GitHub-Trending-MCP

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Usage

### As a Library

```typescript
import { getTrending, getTrendingRepositories, getTrendingStatistics } from './src/index';

// Get today's trending (all languages)
const result = await getTrending();
console.log(result.repositories);

// Get weekly Python trending
const repos = await getTrendingRepositories({
  since: 'weekly',
  language: 'python'
});

// Get statistics
const stats = await getTrendingStatistics({
  since: 'monthly',
  language: 'typescript'
});
```

### Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `since` | `'daily' \| 'weekly' \| 'monthly'` | Time range | `'weekly'` |
| `language` | `string` | Programming language | `'python'`, `'rust'` |
| `spokenLanguageCode` | `string` | Spoken language code | `'en'`, `'zh'` |

### As MCP Server

1. Build the project:
```bash
npm run build
```

2. Configure your MCP client (e.g., Claude Desktop):

Edit `claude_desktop_config.json`:

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

3. Available MCP tools:
- `getTrendingRepositories` - Get trending repository list
- `getTrendingMetadata` - Get page metadata
- `getTrendingStatistics` - Get statistics

### As WorkBuddy Skill

Copy `skill/SKILL.md` to WorkBuddy's skills directory:

```bash
# User-level Skill
cp skill/SKILL.md ~/.codebuddy/skills/github-trending/

# Project-level Skill
cp skill/SKILL.md .codebuddy/skills/github-trending/
```

## Data Structures

### TrendingRepository

```typescript
interface TrendingRepository {
  name: string;              // "owner/repo" format
  url: string;               // Repository URL
  description: string;       // Repository description
  language: string;          // Programming language
  stars: number;             // Star count (integer)
  starsUrl: string;          // Stars page URL
  forks: number;             // Fork count (integer)
  forksUrl: string;          // Forks page URL
  contributors: Contributor[]; // Contributor list
  starsToday: number;        // Stars gained today (integer)
  starsTodayText: string;    // Original text, e.g., "2,149 stars today"
}

interface Contributor {
  username: string;          // GitHub username
  url: string;               // GitHub profile URL
  avatar: string;            // Avatar URL
}
```

### TrendingMetadata

```typescript
interface TrendingMetadata {
  title: string;             // Page title
  description: string;       // Page description
  filterOptions: {
    since: string;           // Current time range
    language?: string;       // Current language filter
    spokenLanguageCode?: string; // Current spoken language filter
  };
}
```

## Examples

### Get Today's Python Trending

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

### Get Weekly TypeScript Projects from Chinese Developers

```typescript
const repos = await getTrendingRepositories({
  since: 'weekly',
  language: 'typescript',
  spokenLanguageCode: 'zh'
});
```

### Get Statistics

```typescript
import { getTrendingStatistics } from './src/index';

const stats = await getTrendingStatistics({ since: 'weekly' });
console.log(`Total repos: ${stats.total}`);
console.log(`Languages:`, stats.languages);
console.log(`Total stars: ${stats.totalStars}`);
```

## Supported Languages

### Programming Languages

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
- ... and more

### Spoken Languages

- `en` - English
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- `fr` - French
- `de` - German
- `es` - Spanish
- `ru` - Russian

## Project Structure

```
github-trending/
├── src/
│   ├── types.ts         # TypeScript type definitions
│   ├── scraper.ts       # Page scraping module
│   ├── parser.ts        # HTML parsing module
│   ├── index.ts         # Main entry, exports API
│   ├── mcp-server.ts    # MCP Server entry
│   └── server.ts        # Web test server
├── public/
│   └── index.html       # Web test interface
├── skill/
│   └── SKILL.md         # WorkBuddy Skill config
├── start-server.bat     # Windows startup script
├── start-server.sh      # Linux/Mac startup script
├── package.json         # Project configuration
├── tsconfig.json        # TypeScript configuration
├── README.md            # Chinese documentation
└── README_EN.md         # English documentation
```

## Development

```bash
# Development mode
npm run dev

# Start web test server
npm run server

# Run MCP Server
npm run mcp-server

# Build
npm run build
```

## Notes

1. **Anti-scraping**: This tool sets reasonable User-Agent and headers, but frequent requests may be rate-limited by GitHub
2. **Data Updates**: GitHub Trending data is updated periodically, not real-time
3. **Page Structure**: Parser may need updates if GitHub page structure changes
4. **Network Issues**: Users in China may need to configure a proxy to access GitHub

## License

Apache 2.0

## Contributing

Issues and Pull Requests are welcome!
