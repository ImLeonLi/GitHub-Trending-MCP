/**
 * GitHub Trending 提取器 - 主入口
 * 提供简洁的 API 用于获取 GitHub Trending 数据
 */

import { fetchTrendingPage } from './scraper';
import { parseTrendingPage, getStatistics } from './parser';
import {
  TrendingFilterOptions,
  TrendingResult,
  TrendingRepository,
  TrendingMetadata
} from './types';

// 重新导出类型
export * from './types';
export { fetchTrendingPage, parseTrendingPage, getStatistics };

/**
 * 获取 GitHub Trending 数据
 * 这是主要的 API 函数，封装了抓取和解析的完整流程
 * 
 * @param options 筛选选项
 * @returns 包含元数据和仓库列表的结果
 * 
 * @example
 * ```typescript
 * // 获取今日所有语言的 Trending
 * const result = await getTrending();
 * 
 * // 获取本周 Python 项目的 Trending
 * const result = await getTrending({
 *   since: 'weekly',
 *   language: 'python'
 * });
 * 
 * // 获取本月中文开发者的 JavaScript 项目
 * const result = await getTrending({
 *   since: 'monthly',
 *   language: 'javascript',
 *   spokenLanguageCode: 'zh'
 * });
 * ```
 */
export async function getTrending(options: TrendingFilterOptions = {}): Promise<TrendingResult> {
  const html = await fetchTrendingPage(options);
  return parseTrendingPage(html, options);
}

/**
 * 获取 Trending 仓库列表（简化版）
 * 只返回仓库列表，不包含元数据
 * 
 * @param options 筛选选项
 * @returns 仓库列表
 */
export async function getTrendingRepositories(
  options: TrendingFilterOptions = {}
): Promise<TrendingRepository[]> {
  const result = await getTrending(options);
  return result.repositories;
}

/**
 * 获取 Trending 页面元数据
 * 
 * @param options 筛选选项
 * @returns 页面元数据
 */
export async function getTrendingMetadata(
  options: TrendingFilterOptions = {}
): Promise<TrendingMetadata> {
  const result = await getTrending(options);
  return result.metadata;
}

/**
 * 获取 Trending 统计信息
 * 
 * @param options 筛选选项
 * @returns 统计信息，包括总数、语言分布、总 stars 和 forks
 */
export async function getTrendingStatistics(options: TrendingFilterOptions = {}) {
  const result = await getTrending(options);
  return getStatistics(result);
}

// 默认导出
export default {
  getTrending,
  getTrendingRepositories,
  getTrendingMetadata,
  getTrendingStatistics,
  fetchTrendingPage,
  parseTrendingPage,
  getStatistics
};
