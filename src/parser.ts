/**
 * HTML 解析模块
 * 使用 cheerio 解析 GitHub Trending 页面，提取结构化数据
 */

import * as cheerio from 'cheerio';
import {
  TrendingRepository,
  TrendingMetadata,
  TrendingResult,
  Contributor,
  TrendingFilterOptions,
  TrendingScraperError
} from './types';

/**
 * 将带千分位的数字字符串转换为纯整数
 * @param numStr 数字字符串，如 "32,458"
 * @returns 纯整数，如 32458
 */
function parseNumber(numStr: string): number {
  if (!numStr) return 0;
  // 移除所有非数字字符（包括千分位逗号、空格等）
  const cleaned = numStr.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * 提取今日新增 stars 的数量
 * @param text 原始文本，如 "2,149 stars today"
 * @returns 纯整数
 */
function parseStarsToday(text: string): number {
  if (!text) return 0;
  const match = text.match(/([\d,]+)/);
  if (match) {
    return parseNumber(match[1]);
  }
  return 0;
}

/**
 * 解析单个仓库元素
 * @param $ cheerio 实例
 * @param element 仓库 article 元素
 * @returns 仓库信息对象
 */
function parseRepository($: cheerio.CheerioAPI, element: any): TrendingRepository | null {
  const $article = $(element);

  try {
    // 提取仓库名称和链接
    const $titleLink = $article.find('h2 a[href^="/"]');
    if ($titleLink.length === 0) {
      return null;
    }

    const href = $titleLink.attr('href') || '';
    const fullName = $titleLink.text().trim().replace(/\s+/g, ' ');
    // 清理名称，移除多余空格和换行
    const name = fullName.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

    // 提取描述
    const $description = $article.find('p[class*="color-fg-muted"]');
    const description = $description.text().trim();

    // 提取编程语言
    const $language = $article.find('[itemprop="programmingLanguage"]');
    const language = $language.text().trim();

    // 提取 Stars 数量和链接
    const $starsLink = $article.find('a[href$="/stargazers"]');
    const starsText = $starsLink.text().trim();
    const stars = parseNumber(starsText);
    const starsUrl = $starsLink.attr('href') 
      ? `https://github.com${$starsLink.attr('href')}` 
      : `https://github.com${href}/stargazers`;

    // 提取 Forks 数量和链接
    const $forksLink = $article.find('a[href$="/forks"]');
    const forksText = $forksLink.text().trim();
    const forks = parseNumber(forksText);
    const forksUrl = $forksLink.attr('href')
      ? `https://github.com${$forksLink.attr('href')}`
      : `https://github.com${href}/forks`;

    // 提取今日新增 stars
    const $starsToday = $article.find('.float-sm-right, [class*="stars today"]');
    const starsTodayText = $starsToday.text().trim();
    const starsToday = parseStarsToday(starsTodayText);

    // 提取贡献者列表
    const contributors: Contributor[] = [];
    $article.find('img.avatar').each((_, img) => {
      const $img = $(img);
      const $link = $img.closest('a');
      const avatar = $img.attr('src') || '';
      const username = $img.attr('alt')?.replace('@', '') || '';
      const userHref = $link.attr('href') || '';
      
      if (username && avatar) {
        contributors.push({
          username,
          url: userHref.startsWith('http') ? userHref : `https://github.com${userHref}`,
          avatar
        });
      }
    });

    return {
      name,
      url: `https://github.com${href}`,
      description,
      language,
      stars,
      starsUrl,
      forks,
      forksUrl,
      contributors,
      starsToday,
      starsTodayText
    };
  } catch (error) {
    console.warn('解析仓库元素时出错:', error);
    return null;
  }
}

/**
 * 解析页面元数据
 * @param $ cheerio 实例
 * @param options 筛选选项
 * @returns 页面元数据
 */
function parseMetadata($: cheerio.CheerioAPI, options: TrendingFilterOptions): TrendingMetadata {
  // 提取页面标题 - 从 title 标签或页面头部
  let title = 'Trending';
  const pageTitle = $('title').text().trim();
  if (pageTitle && pageTitle.includes('Trending')) {
    title = 'Trending';
  }
  
  // 根据 since 参数构建描述
  const sinceText = {
    'daily': 'today',
    'weekly': 'this week',
    'monthly': 'this month'
  }[options.since || 'daily'];
  const description = `See what the GitHub community is most excited about ${sinceText}.`;

  return {
    title,
    description,
    filterOptions: {
      since: options.since || 'daily',
      language: options.language,
      spokenLanguageCode: options.spokenLanguageCode
    }
  };
}

/**
 * 解析 GitHub Trending 页面 HTML
 * @param html 页面 HTML 字符串
 * @param options 筛选选项（用于构建元数据）
 * @returns 解析结果，包含元数据和仓库列表
 * @throws TrendingScraperError 解析失败时抛出
 */
export function parseTrendingPage(html: string, options: TrendingFilterOptions = {}): TrendingResult {
  try {
    const $ = cheerio.load(html);

    // 检查是否是有效的 GitHub 页面
    if ($('article.Box-row').length === 0) {
      // 检查是否是错误页面
      const errorText = $('h1, .blankslate h3').first().text().trim();
      if (errorText && (errorText.includes('404') || errorText.includes('Not Found'))) {
        throw new TrendingScraperError(
          '页面未找到，请检查筛选参数是否正确',
          'NOT_FOUND'
        );
      }
    }

    // 解析元数据
    const metadata = parseMetadata($, options);

    // 解析仓库列表
    const repositories: TrendingRepository[] = [];
    $('article.Box-row').each((_, element) => {
      const repo = parseRepository($, element);
      if (repo) {
        repositories.push(repo);
      }
    });

    // 如果没有找到任何仓库，可能是页面结构变化
    if (repositories.length === 0) {
      console.warn('警告: 未找到任何仓库，可能是页面结构发生变化');
    }

    return {
      metadata,
      repositories
    };
  } catch (error) {
    if (error instanceof TrendingScraperError) {
      throw error;
    }
    throw new TrendingScraperError(
      `解析页面失败: ${error instanceof Error ? error.message : String(error)}`,
      'PARSE_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 获取仓库数量统计
 * @param result 解析结果
 * @returns 统计信息
 */
export function getStatistics(result: TrendingResult): {
  total: number;
  languages: Record<string, number>;
  totalStars: number;
  totalForks: number;
} {
  const languages: Record<string, number> = {};
  let totalStars = 0;
  let totalForks = 0;

  for (const repo of result.repositories) {
    // 统计语言
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
    // 统计 stars 和 forks
    totalStars += repo.stars;
    totalForks += repo.forks;
  }

  return {
    total: result.repositories.length,
    languages,
    totalStars,
    totalForks
  };
}

// 默认导出
export default {
  parseTrendingPage,
  getStatistics
};
