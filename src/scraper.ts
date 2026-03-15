/**
 * Page scraping module
 * Responsible for building URLs and sending HTTP requests to get GitHub Trending page
 */

import axios, { AxiosError } from 'axios';
import {
  TrendingFilterOptions,
  TrendingScraperError,
  TimeRange
} from './types';

/**
 * GitHub Trending base URL
 */
const GITHUB_TRENDING_BASE_URL = 'https://github.com/trending';

/**
 * Default request headers, simulating browser access
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
 * Build GitHub Trending URL
 * @param options Filter options
 * @returns Complete URL string
 */
export function buildTrendingUrl(options: TrendingFilterOptions = {}): string {
  const { since = 'daily', language, spokenLanguageCode } = options;

  // Build base path
  let url = GITHUB_TRENDING_BASE_URL;
  if (language) {
    // URL encode language name to handle special characters like C++
    const encodedLanguage = encodeURIComponent(language);
    url += `/${encodedLanguage}`;
  }

  // Build query parameters
  const params = new URLSearchParams();
  
  // since parameter mapping
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
 * Fetch GitHub Trending page HTML
 * @param options Filter options
 * @returns Page HTML string
 * @throws TrendingScraperError When fetching fails
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
          'Request timeout, please check network connection',
          'NETWORK_ERROR',
          error
        );
      }
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          throw new TrendingScraperError(
            `Page not found, please check if filter parameters are correct: ${url}`,
            'NOT_FOUND',
            error
          );
        }
        throw new TrendingScraperError(
          `HTTP error ${status}: ${error.message}`,
          'NETWORK_ERROR',
          error
        );
      }
      if (error.request) {
        throw new TrendingScraperError(
          'Network request failed, please check network connection',
          'NETWORK_ERROR',
          error
        );
      }
    }
    
    throw new TrendingScraperError(
      `Unknown error: ${error instanceof Error ? error.message : String(error)}`,
      'UNKNOWN_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get current request configuration (for debugging)
 * @param options Filter options
 * @returns Request configuration information
 */
export function getRequestConfig(options: TrendingFilterOptions = {}) {
  return {
    url: buildTrendingUrl(options),
    headers: DEFAULT_HEADERS,
    timeout: 30000
  };
}

/**
 * Validate filter parameters
 * @param options Filter options
 * @returns Validation result
 */
export function validateFilterOptions(options: TrendingFilterOptions): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate since parameter
  if (options.since !== undefined) {
    const validTimeRanges: TimeRange[] = ['daily', 'weekly', 'monthly'];
    if (!validTimeRanges.includes(options.since)) {
      errors.push(`Invalid since parameter: ${options.since}, valid values: ${validTimeRanges.join(', ')}`);
    }
  }

  // Validate language parameter (basic validation, non-empty string)
  if (options.language !== undefined) {
    if (typeof options.language !== 'string' || options.language.trim() === '') {
      errors.push('language parameter must be a non-empty string');
    }
  }

  // Validate spokenLanguageCode parameter (basic validation, non-empty string)
  if (options.spokenLanguageCode !== undefined) {
    if (typeof options.spokenLanguageCode !== 'string' || options.spokenLanguageCode.trim() === '') {
      errors.push('spokenLanguageCode parameter must be a non-empty string');
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
