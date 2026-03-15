/**
 * GitHub Trending 页面内容提取工具的类型定义
 */

/**
 * 时间范围选项
 */
export type TimeRange = 'daily' | 'weekly' | 'monthly';

/**
 * 筛选参数接口
 */
export interface TrendingFilterOptions {
  /**
   * 时间范围
   * - daily: 今日趋势
   * - weekly: 本周趋势
   * - monthly: 本月趋势
   * @default 'daily'
   */
  since?: TimeRange;

  /**
   * 编程语言筛选
   * 例如: 'java', 'python', 'typescript', 'rust', 'go', 'c', 'c++', 'c#'
   */
  language?: string;

  /**
   * 开发者口语语言代码
   * 例如: 'en' (English), 'zh' (Chinese), 'ja' (Japanese), 'fr' (French)
   */
  spokenLanguageCode?: string;
}

/**
 * 贡献者信息
 */
export interface Contributor {
  /**
   * GitHub 用户名
   */
  username: string;

  /**
   * GitHub 主页链接
   */
  url: string;

  /**
   * 头像 URL
   */
  avatar: string;
}

/**
 * 趋势仓库信息
 */
export interface TrendingRepository {
  /**
   * 仓库全名，格式: owner/repo
   * 例如: "microsoft/BitNet"
   */
  name: string;

  /**
   * 仓库链接
   * 例如: "https://github.com/microsoft/BitNet"
   */
  url: string;

  /**
   * 仓库描述
   */
  description: string;

  /**
   * 主要编程语言
   * 例如: "Python", "TypeScript", "Rust"
   */
  language: string;

  /**
   * Star 数量（纯整数，已去除千分位）
   */
  stars: number;

  /**
   * Star 页面链接
   */
  starsUrl: string;

  /**
   * Fork 数量（纯整数，已去除千分位）
   */
  forks: number;

  /**
   * Fork 页面链接
   */
  forksUrl: string;

  /**
   * 贡献者列表
   */
  contributors: Contributor[];

  /**
   * 今日新增 stars（纯整数，已去除千分位）
   */
  starsToday: number;

  /**
   * 今日新增 stars 原始文本
   * 例如: "2,149 stars today"
   */
  starsTodayText: string;
}

/**
 * 页面筛选选项信息
 */
export interface FilterOptions {
  /**
   * 当前时间范围
   */
  since: string;

  /**
   * 当前编程语言筛选
   */
  language?: string;

  /**
   * 当前口语语言筛选
   */
  spokenLanguageCode?: string;
}

/**
 * 页面元数据
 */
export interface TrendingMetadata {
  /**
   * 页面标题
   * 例如: "Trending"
   */
  title: string;

  /**
   * 页面描述
   * 例如: "See what the GitHub community is most excited about this week."
   */
  description: string;

  /**
   * 当前应用的筛选选项
   */
  filterOptions: FilterOptions;
}

/**
 * 抓取结果
 */
export interface TrendingResult {
  /**
   * 页面元数据
   */
  metadata: TrendingMetadata;

  /**
   * 趋势仓库列表
   */
  repositories: TrendingRepository[];
}

/**
 * 抓取错误类型
 */
export class TrendingScraperError extends Error {
  constructor(
    message: string,
    public readonly code: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'NOT_FOUND' | 'UNKNOWN_ERROR',
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'TrendingScraperError';
  }
}
