/**
 * 页面抓取模块
 * 负责构建 URL 和发送 HTTP 请求获取 GitHub Trending 页面
 */

import axios, { AxiosError } from 'axios';
import {
  TrendingFilterOptions,
  TrendingScraperError,
  TimeRange
} from './types';

/**
 * GitHub Trending 基础 URL
 */
const GITHUB_TRENDING_BASE_URL = 'https://github.com/trending';

/**
 * 默认请求头，模拟浏览器访问
 */
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0'
};

/**
 * 构建 GitHub Trending URL
 * @param options 筛选选项
 * @returns 完整的 URL 字符串
 */
export function buildTrendingUrl(options: TrendingFilterOptions = {}): string {
  const { since = 'daily', language, spokenLanguageCode } = options;

  // 构建基础路径
  let url = GITHUB_TRENDING_BASE_URL;
  if (language) {
    // 对语言名称进行 URL 编码，处理特殊字符如 C++
    const encodedLanguage = encodeURIComponent(language);
    url += `/${encodedLanguage}`;
  }

  // 构建查询参数
  const params = new URLSearchParams();
  
  // since 参数映射
  const sinceMap: Record<TimeRange, string> = {
    'daily': 'daily',
    'weekly': 'weekly',
    'monthly': 'monthly'
  };
  params.append('since', sinceMap[since] || 'daily');

  // spoken_language_code 参数
  if (spokenLanguageCode) {
    params.append('spoken_language_code', spokenLanguageCode);
  }

  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}

/**
 * 抓取 GitHub Trending 页面 HTML
 * @param options 筛选选项
 * @returns 页面 HTML 字符串
 * @throws TrendingScraperError 抓取失败时抛出
 */
export async function fetchTrendingPage(options: TrendingFilterOptions = {}): Promise<string> {
  const url = buildTrendingUrl(options);

  try {
    const response = await axios.get(url, {
      headers: DEFAULT_HEADERS,
      timeout: 30000, // 30 秒超时
      maxRedirects: 5,
      validateStatus: (status) => status === 200
    });

    return response.data as string;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        throw new TrendingScraperError(
          '请求超时，请检查网络连接',
          'NETWORK_ERROR',
          error
        );
      }
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          throw new TrendingScraperError(
            `页面未找到，请检查筛选参数是否正确: ${url}`,
            'NOT_FOUND',
            error
          );
        }
        throw new TrendingScraperError(
          `HTTP 错误 ${status}: ${error.message}`,
          'NETWORK_ERROR',
          error
        );
      }
      if (error.request) {
        throw new TrendingScraperError(
          '网络请求失败，请检查网络连接',
          'NETWORK_ERROR',
          error
        );
      }
    }
    
    throw new TrendingScraperError(
      `未知错误: ${error instanceof Error ? error.message : String(error)}`,
      'UNKNOWN_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 获取当前使用的请求配置（用于调试）
 * @param options 筛选选项
 * @returns 请求配置信息
 */
export function getRequestConfig(options: TrendingFilterOptions = {}) {
  return {
    url: buildTrendingUrl(options),
    headers: DEFAULT_HEADERS,
    timeout: 30000
  };
}

/**
 * 验证筛选参数是否有效
 * @param options 筛选选项
 * @returns 验证结果
 */
export function validateFilterOptions(options: TrendingFilterOptions): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证 since 参数
  if (options.since !== undefined) {
    const validTimeRanges: TimeRange[] = ['daily', 'weekly', 'monthly'];
    if (!validTimeRanges.includes(options.since)) {
      errors.push(`无效的 since 参数: ${options.since}，可选值: ${validTimeRanges.join(', ')}`);
    }
  }

  // 验证 language 参数（基本验证，非空字符串）
  if (options.language !== undefined) {
    if (typeof options.language !== 'string' || options.language.trim() === '') {
      errors.push('language 参数必须是非空字符串');
    }
  }

  // 验证 spokenLanguageCode 参数（基本验证，非空字符串）
  if (options.spokenLanguageCode !== undefined) {
    if (typeof options.spokenLanguageCode !== 'string' || options.spokenLanguageCode.trim() === '') {
      errors.push('spokenLanguageCode 参数必须是非空字符串');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 默认导出
export default {
  buildTrendingUrl,
  fetchTrendingPage,
  getRequestConfig,
  validateFilterOptions
};
