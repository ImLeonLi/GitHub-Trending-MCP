/**
 * HTML parsing module
 * Uses cheerio to parse GitHub Trending page and extract structured data
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
 * Convert number string with thousand separators to integer
 * @param numStr Number string, e.g. "32,458"
 * @returns Integer, e.g. 32458
 */
function parseNumber(numStr: string): number {
  if (!numStr) return 0;
  // Remove all non-digit characters (including thousand separators, spaces, etc.)
  const cleaned = numStr.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Extract stars gained today
 * @param text Original text, e.g. "2,149 stars today"
 * @returns Integer
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
 * Parse single repository element
 * @param $ cheerio instance
 * @param element Repository article element
 * @returns Repository information object
 */
function parseRepository($: cheerio.CheerioAPI, element: any): TrendingRepository | null {
  const $article = $(element);

  try {
    // Extract repository name and link
    const $titleLink = $article.find('h2 a[href^="/"]');
    if ($titleLink.length === 0) {
      return null;
    }

    const href = $titleLink.attr('href') || '';
    const fullName = $titleLink.text().trim().replace(/\s+/g, ' ');
    // Clean name, remove extra spaces and newlines
    const name = fullName.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

    // Extract description
    const $description = $article.find('p[class*="color-fg-muted"]');
    const description = $description.text().trim();

    // Extract programming language
    const $language = $article.find('[itemprop="programmingLanguage"]');
    const language = $language.text().trim();

    // Extract Stars count and link
    const $starsLink = $article.find('a[href$="/stargazers"]');
    const starsText = $starsLink.text().trim();
    const stars = parseNumber(starsText);
    const starsUrl = $starsLink.attr('href') 
      ? `https://github.com${$starsLink.attr('href')}` 
      : `https://github.com${href}/stargazers`;

    // Extract Forks count and link
    const $forksLink = $article.find('a[href$="/forks"]');
    const forksText = $forksLink.text().trim();
    const forks = parseNumber(forksText);
    const forksUrl = $forksLink.attr('href')
      ? `https://github.com${$forksLink.attr('href')}`
      : `https://github.com${href}/forks`;

    // Extract stars gained today
    const $starsToday = $article.find('.float-sm-right, [class*="stars today"]');
    const starsTodayText = $starsToday.text().trim();
    const starsToday = parseStarsToday(starsTodayText);

    // Extract contributors list
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
    console.warn('Error parsing repository element:', error);
    return null;
  }
}

/**
 * Parse page metadata
 * @param $ cheerio instance
 * @param options Filter options
 * @returns Page metadata
 */
function parseMetadata($: cheerio.CheerioAPI, options: TrendingFilterOptions): TrendingMetadata {
  // Extract page title - from title tag or page header
  let title = 'Trending';
  const pageTitle = $('title').text().trim();
  if (pageTitle && pageTitle.includes('Trending')) {
    title = 'Trending';
  }
  
  // Build description based on since parameter
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
 * Parse GitHub Trending page HTML
 * @param html Page HTML string
 * @param options Filter options (for building metadata)
 * @returns Parsing result, including metadata and repository list
 * @throws TrendingScraperError When parsing fails
 */
export function parseTrendingPage(html: string, options: TrendingFilterOptions = {}): TrendingResult {
  try {
    const $ = cheerio.load(html);

    // Check if it's a valid GitHub page
    if ($('article.Box-row').length === 0) {
      // Check if it's an error page
      const errorText = $('h1, .blankslate h3').first().text().trim();
      if (errorText && (errorText.includes('404') || errorText.includes('Not Found'))) {
        throw new TrendingScraperError(
          'Page not found, please check if filter parameters are correct',
          'NOT_FOUND'
        );
      }
    }

    // Parse metadata
    const metadata = parseMetadata($, options);

    // Parse repository list
    const repositories: TrendingRepository[] = [];
    $('article.Box-row').each((_, element) => {
      const repo = parseRepository($, element);
      if (repo) {
        repositories.push(repo);
      }
    });

    // If no repositories found, page structure may have changed
    if (repositories.length === 0) {
      console.warn('Warning: No repositories found, page structure may have changed');
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
      `Failed to parse page: ${error instanceof Error ? error.message : String(error)}`,
      'PARSE_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get repository statistics
 * @param result Parsing result
 * @returns Statistics information
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
    // Count languages
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
    // Count stars and forks
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
