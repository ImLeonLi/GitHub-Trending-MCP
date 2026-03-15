---
name: github-trending
description: This skill should be used when users want to fetch and analyze GitHub Trending repositories. It provides tools to scrape trending repositories with filters for time range (daily/weekly/monthly), programming language, and spoken language. Use this skill when users ask about trending repos, popular projects, GitHub rankings, or want to discover new repositories in specific languages.
---

# GitHub Trending Skill

This skill provides capabilities to fetch and analyze GitHub Trending repositories.

## Overview

The GitHub Trending skill allows you to:
- Fetch trending repositories from GitHub
- Filter by time range (daily, weekly, monthly)
- Filter by programming language
- Filter by developer spoken language
- Get repository statistics and metadata

## When to Use

Use this skill when:
- User asks about "GitHub trending" or "trending repositories"
- User wants to discover popular projects
- User asks about "what's hot on GitHub"
- User wants to find repositories in a specific language
- User asks for repository rankings or statistics

## Available Tools

### getTrendingRepositories

Fetches trending repositories from GitHub with optional filters.

**Parameters:**
- `since` (string, optional): Time range - "daily", "weekly", or "monthly". Default: "daily"
- `language` (string, optional): Programming language filter (e.g., "python", "javascript", "rust")
- `spokenLanguageCode` (string, optional): Developer spoken language code (e.g., "en", "zh", "ja")

**Example Usage:**
```typescript
// Get today's trending Python repositories
const result = await getTrendingRepositories({
  since: 'daily',
  language: 'python'
});

// Get weekly trending TypeScript projects from Chinese developers
const result = await getTrendingRepositories({
  since: 'weekly',
  language: 'typescript',
  spokenLanguageCode: 'zh'
});
```

### getTrendingMetadata

Fetches metadata about the GitHub Trending page, including title, description, and applied filters.

**Parameters:**
- Same as getTrendingRepositories

### getTrendingStatistics

Fetches statistical information about trending repositories, including:
- Total repository count
- Language distribution
- Total stars and forks

**Parameters:**
- Same as getTrendingRepositories

## MCP Server Configuration

To use this skill with MCP, add the following to your MCP settings:

```json
{
  "mcpServers": {
    "github-trending": {
      "command": "node",
      "args": ["<path-to-project>/dist/mcp-server.js"],
      "description": "GitHub Trending repository scraper"
    }
  }
}
```

## Response Format

### Repository Object

```typescript
{
  name: string;           // "owner/repo" format
  url: string;            // Repository URL
  description: string;    // Repository description
  language: string;       // Primary programming language
  stars: number;          // Total stars (integer)
  starsUrl: string;       // Stars page URL
  forks: number;          // Total forks (integer)
  forksUrl: string;       // Forks page URL
  starsToday: number;     // Stars gained today (integer)
  starsTodayText: string; // Original text (e.g., "2,149 stars today")
  contributors: [{
    username: string;
    url: string;
    avatar: string;
  }];
}
```

## Common Language Values

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

## Common Spoken Language Codes

- `en` - English
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- `fr` - French
- `de` - German
- `es` - Spanish
- `ru` - Russian

## Example Workflows

### Discover Weekly Trending Projects

1. Call `getTrendingRepositories` with `since: 'weekly'`
2. Present the results with repository names, descriptions, and star counts
3. Optionally show language distribution using `getTrendingStatistics`

### Find Popular Python Projects

1. Call `getTrendingRepositories` with `language: 'python'`
2. Sort or filter results by stars or recent activity
3. Provide links to top repositories

### Analyze Language Trends

1. Call `getTrendingStatistics` for different languages
2. Compare repository counts and star statistics
3. Identify trending languages

## Error Handling

Common errors and their meanings:
- `NETWORK_ERROR` - Connection issues, check internet connection
- `NOT_FOUND` - Invalid language or parameters
- `PARSE_ERROR` - GitHub page structure changed

## Notes

- GitHub Trending updates periodically throughout the day
- Results are cached by GitHub and may not be real-time
- Some repositories may not have all fields populated (e.g., language, description)
