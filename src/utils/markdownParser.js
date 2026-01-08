/**
 * Clean Markdown Parser Utility
 * Uses articles.json for metadata and fetches real markdown content
 */

export class MarkdownParser {
  constructor() {
    this.articlesCache = new Map();
  }

  /**
   * Simple frontmatter parser for browser (no Node.js dependencies)
   */
  parseMarkdown(content) {
    // Check if content starts with frontmatter (---)
    if (!content.startsWith('---')) {
      return {
        frontmatter: {},
        content: content
      };
    }

    // Find the end of frontmatter
    const endIndex = content.indexOf('---', 3);
    if (endIndex === -1) {
      return {
        frontmatter: {},
        content: content
      };
    }

    // Extract frontmatter and content
    const frontmatterText = content.slice(3, endIndex).trim();
    const markdownContent = content.slice(endIndex + 3).trim();

    // Parse frontmatter (simple YAML-like parsing)
    const frontmatter = this.parseYamlLike(frontmatterText);

    return {
      frontmatter: frontmatter,
      content: markdownContent
    };
  }

  /**
   * Simple YAML-like parser for frontmatter
   */
  parseYamlLike(text) {
    const result = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.slice(0, colonIndex).trim();
      let value = trimmed.slice(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Handle arrays (simple case)
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        result[key] = arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''));
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Extract article data by combining metadata from articles.json with markdown content
   */
  async extractArticleData(slug) {
    try {
      const { articlesAPI } = await import('./articlesAPI.js')
      
      // Get metadata from articles.json
      const metadata = await articlesAPI.findArticleBySlug(slug)
      if (!metadata) {
        console.error(`No metadata found for slug: ${slug}`)
        return null
      }

      // Get markdown content
      const content = await articlesAPI.getArticle(slug)
      if (!content) {
        console.error(`No content found for slug: ${slug}`)
        return null
      }

      // Parse markdown to get any additional frontmatter
      const { frontmatter, content: markdownContent } = this.parseMarkdown(content)

      // Combine metadata from articles.json with any frontmatter overrides
      return {
        slug: metadata.slug,
        title: frontmatter.title || metadata.title,
        excerpt: frontmatter.excerpt || metadata.excerpt,
        thumbnail: frontmatter.thumbnail || metadata.thumbnail,
        date: frontmatter.date || metadata.date,
        author: {
          name: frontmatter.author?.name || metadata.author?.name || 'Anonymous',
          avatar: frontmatter.author?.avatar || metadata.author?.avatar || '',
          tagline: frontmatter.author?.tagline || metadata.author?.tagline || '',
          links: frontmatter.author?.links || metadata.author?.links || {}
        },
        categories: frontmatter.categories || metadata.categories || ['General'],
        readingTime: frontmatter.readingTime || metadata.readingTime,
        content: markdownContent,
        frontmatter: frontmatter
      }
    } catch (error) {
      console.error(`Failed to extract article data for ${slug}:`, error)
      return null
    }
  }

  /**
   * Load all articles - combines metadata from articles.json with content
   */
  async loadAllArticles() {
    try {
      const { articlesAPI } = await import('./articlesAPI.js')
      const articlesList = await articlesAPI.getArticlesList()
      console.log('Articles list from API:', articlesList)
      
      const articles = []

      for (const articleInfo of articlesList) {
        try {
          console.log(`Processing article: ${articleInfo.slug}`)
          const articleData = await this.extractArticleData(articleInfo.slug)
          if (articleData) {
            articles.push(articleData)
            console.log(`✅ Loaded article: ${articleData.title}`)
          } else {
            console.warn(`⚠️ Failed to load: ${articleInfo.slug}`)
          }
        } catch (error) {
          console.error(`❌ Error loading article: ${articleInfo.slug}`, error)
        }
      }

      // Sort articles by date (newest first)
      articles.sort((a, b) => new Date(b.date) - new Date(a.date))
      console.log(`📚 Total articles loaded: ${articles.length}`)

      return articles
    } catch (error) {
      console.error('Failed to load articles:', error)
      return []
    }
  }

  /**
   * Load a single article by slug
   */
  async loadArticle(slug) {
    if (this.articlesCache.has(slug)) {
      return this.articlesCache.get(slug)
    }

    try {
      const articleData = await this.extractArticleData(slug)
      if (articleData) {
        this.articlesCache.set(slug, articleData)
        console.log(`✅ Loaded single article: ${articleData.title}`)
        return articleData
      }
      
      console.error(`❌ No data found for slug: ${slug}`)
      return null
    } catch (error) {
      console.error(`Failed to load article ${slug}:`, error)
      return null
    }
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category) {
    const allArticles = await this.loadAllArticles();
    return allArticles.filter(article => 
      article.categories.some(cat => 
        cat.toLowerCase() === category.toLowerCase()
      )
    );
  }

  /**
   * Search articles by query
   */
  async searchArticles(query) {
    const allArticles = await this.loadAllArticles();
    const searchTerm = query.toLowerCase();

    return allArticles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.categories.some(cat => cat.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(limit = 3) {
    const allArticles = await this.loadAllArticles();
    return allArticles.slice(0, limit);
  }

  /**
   * Get recent articles
   */
  async getRecentArticles(limit = 5) {
    const allArticles = await this.loadAllArticles();
    return allArticles.slice(0, limit);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.articlesCache.clear();
  }
}

// Create a singleton instance
export const markdownParser = new MarkdownParser();

// Utility functions for common operations
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateArticleUrl = (date, title) => {
  const formattedDate = date.split('T')[0]; // Get YYYY-MM-DD format
  const slug = slugify(title);
  return `${formattedDate}-${slug}`;
};