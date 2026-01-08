/**
 * Articles API - Clean service using articles.json as metadata source
 */

export class ArticlesAPI {
  constructor() {
    this.baseURL = '/Articles'
    this.articlesCache = new Map()
    this.metadataCache = null
  }

  /**
   * Load articles metadata from articles.json
   */
  async loadArticlesMetadata() {
    if (this.metadataCache) {
      return this.metadataCache
    }

    try {
      const url = `${this.baseURL}/articles.json`
      console.log('Loading articles metadata from:', url)
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const metadata = data.articles || data
      this.metadataCache = metadata
      console.log(`✅ Loaded ${metadata.length} articles metadata`)
      return metadata
    } catch (error) {
      console.error('Failed to load articles metadata:', error)
      return []
    }
  }

  /**
   * Fetch article content from the public directory
   */
  async fetchArticleContent(filename) {
    try {
      console.log(`Fetching content: ${this.baseURL}/${filename}`)
      const response = await fetch(`${this.baseURL}/${filename}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'text/plain, text/markdown, */*'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const content = await response.text()
      console.log(`✅ Successfully loaded ${filename}, length: ${content.length}`)
      return content
    } catch (error) {
      console.error(`❌ Failed to fetch article ${filename}:`, error)
      return null
    }
  }

  /**
   * Get list of all available articles from metadata
   */
  async getArticlesList() {
    const metadata = await this.loadArticlesMetadata()
    return metadata.map(article => ({
      filename: article.filename,
      slug: article.slug,
      date: article.date,
      title: article.title,
      excerpt: article.excerpt,
      thumbnail: article.thumbnail,
      author: article.author,
      categories: article.categories,
      readingTime: article.readingTime
    }))
  }

  /**
   * Find article metadata by slug
   */
  async findArticleBySlug(slug) {
    const metadata = await this.loadArticlesMetadata()
    return metadata.find(article => article.slug === slug)
  }

  /**
   * Get article content with caching
   */
  async getArticle(slug) {
    if (this.articlesCache.has(slug)) {
      return this.articlesCache.get(slug)
    }

    const articleMetadata = await this.findArticleBySlug(slug)
    if (!articleMetadata) {
      console.error(`No metadata found for slug: ${slug}`)
      return null
    }

    const content = await this.fetchArticleContent(articleMetadata.filename)
    if (content) {
      this.articlesCache.set(slug, content)
    }

    return content
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.articlesCache.clear()
    this.metadataCache = null
  }
}

// Create singleton instance
export const articlesAPI = new ArticlesAPI()

// Utility functions for article management
export const getArticleUrl = (date, title) => {
  const formattedDate = date.split('T')[0] // Get YYYY-MM-DD format
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${formattedDate}-${slug}`
}

export const parseArticleFilename = (filename) => {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/)
  if (!match) return null
  
  return {
    date: match[1],
    slug: match[2],
    filename
  }
}

export const formatArticleDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}