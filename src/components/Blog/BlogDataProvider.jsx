import React, { useState, useEffect, createContext, useContext } from 'react';

// Context for sharing blog data across components
const BlogDataContext = createContext();

// Custom hook to use blog data
export const useBlogData = () => {
  const context = useContext(BlogDataContext);
  if (!context) {
    throw new Error('useBlogData must be used within a BlogDataProvider');
  }
  return context;
};

// Utility function to parse markdown content
const parseMarkdown = (markdown) => {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-100">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-100">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-6 text-gray-50">$1</h1>')
    
    // Code blocks (must be processed before inline code)
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, language, code) => {
      return `<pre class="bg-gray-800 rounded-lg p-4 my-4 overflow-x-auto border border-gray-700"><code class="text-sm font-mono text-gray-100">${escapeHtml(code.trim())}</code></pre>`;
    })
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-100">$1</code>')
    
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      // Correctly use process.env.PUBLIC_URL inside a function
    //   const imageUrl = `${process.env.PUBLIC_URL}${url}`;
      return `<img src="${url}" alt="${alt}" class="max-w-full h-auto my-4 rounded-lg shadow-md" loading="lazy" />`;
    })

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-300 hover:text-blue-200 underline">$1</a>')
    
    

    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-400 pl-4 my-4 italic text-gray-100 bg-gray-800/80 py-2">$1</blockquote>')
    
    // Unordered lists
    .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1 text-gray-200">$1</li>')
    
    // Ordered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1 text-gray-200">$1</li>')
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-t border-gray-700 my-8">')
    
    // Line breaks and paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-200">')
    // .replace(/\n/g, '<br>');

  // Wrap in paragraphs and clean up
  html = '<p class="mb-4 leading-relaxed text-gray-200">' + html + '</p>';
  
  // Clean up formatting
  html = html
    .replace(/<p class="mb-4 leading-relaxed text-gray-700"><\/p>/g, '')
    .replace(/<p class="mb-4 leading-relaxed text-gray-700">(<h[1-6])/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p class="mb-4 leading-relaxed text-gray-700">(<pre)/g, '$1')
    .replace(/(<\/pre>)<\/p>/g, '$1')
    .replace(/<p class="mb-4 leading-relaxed text-gray-700">(<blockquote)/g, '$1')
    .replace(/(<\/blockquote>)<\/p>/g, '$1')
    .replace(/<p class="mb-4 leading-relaxed text-gray-700">(<ul|<ol)/g, '$1')
    .replace(/(<\/ul>|<\/ol>)<\/p>/g, '$1')
    .replace(/<p class="mb-4 leading-relaxed text-gray-700">(<hr)/g, '$1')
    .replace(/(<hr[^>]*>)<\/p>/g, '$1');

  // Handle lists properly
  html = html.replace(/(<li class="ml-4 mb-1">.*<\/li>)/gs, (match) => {
    return `<ul class="list-disc list-inside my-4 space-y-1">${match}</ul>`;
  });

  return html;
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Main BlogDataProvider component
const BlogDataProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [articlesContent, setArticlesContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch articles metadata
  const fetchArticlesMetadata = async () => {
    try {
      const response = await fetch('/Articles/articles.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch articles metadata: ${response.status}`);
      }
      const data = await response.json();
      return data.articles || data; // Handle both {articles: [...]} and [...] formats
    } catch (err) {
      console.error('Error fetching articles metadata:', err);
      throw err;
    }
  };

  // Fetch individual markdown file content
  const fetchMarkdownContent = async (filename) => {
    try {
      const response = await fetch(`/Articles/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}: ${response.status}`);
      }
      const content = await response.text();
      return content;
    } catch (err) {
      console.error(`Error fetching ${filename}:`, err);
      throw err;
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch articles metadata
        const articlesData = await fetchArticlesMetadata();
        setArticles(articlesData);

        // Fetch content for all articles
        const contentPromises = articlesData.map(async (article) => {
          try {
            const content = await fetchMarkdownContent(article.filename);
            return { id: article.id, content };
          } catch (err) {
            console.warn(`Failed to load content for ${article.filename}, using fallback`);
            return { 
              id: article.id, 
              content: generateFallbackContent(article)
            };
          }
        });

        const contentResults = await Promise.all(contentPromises);
        const contentMap = {};
        contentResults.forEach(({ id, content }) => {
          contentMap[id] = content;
        });

        setArticlesContent(contentMap);
      } catch (err) {
        setError(err.message);
        console.error('Failed to initialize blog data:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Generate fallback content if markdown file is missing
  const generateFallbackContent = (article) => {
    return `# ${article.title}

${article.excerpt}

This is a sample article demonstrating the blog functionality. The original markdown file for this article is not available.

## Sample Content

This article would normally contain the full content loaded from the markdown file \`${article.filename}\`.

### Features

- **Markdown Support**: Full markdown rendering with syntax highlighting
- **Image Support**: Images are automatically processed and optimized
- **Code Blocks**: Syntax highlighting for code examples
- **Responsive Design**: Mobile-first responsive layout

### Code Example

\`\`\`javascript
const blogPost = {
  title: "${article.title}",
  date: "${article.date}",
  author: "${article.author.name}"
};

console.log("Blog post loaded:", blogPost);
\`\`\`

## Conclusion

This is placeholder content. Replace with your actual markdown file at \`/articles/${article.filename}\`.
`;
  };

  // Get article by slug
  const getArticleBySlug = (slug) => {
    return articles.find(article => article.slug === slug);
  };

  // Get article content by ID
  const getArticleContent = (id) => {
    return articlesContent[id] || '';
  };

  // Get parsed HTML content for article
  const getArticleHTML = (id) => {
    const content = getArticleContent(id);
    return parseMarkdown(content);
  };

  // Get articles by category
  const getArticlesByCategory = (category) => {
    return articles.filter(article => 
      article.category.toLowerCase() === category.toLowerCase()
    );
  };

  // Get featured articles
  const getFeaturedArticles = () => {
    return articles.filter(article => article.featured === true);
  };

  // Search articles
  const searchArticles = (query) => {
    const searchTerm = query.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.category.toLowerCase().includes(searchTerm) ||
      (article.tags && article.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      ))
    );
  };

  // Get all categories
  const getCategories = () => {
    const categories = [...new Set(articles.map(article => article.category))];
    return categories;
  };

  // Get all tags
  const getTags = () => {
    const allTags = articles.reduce((tags, article) => {
      if (article.tags) {
        return [...tags, ...article.tags];
      }
      return tags;
    }, []);
    return [...new Set(allTags)];
  };

  // Sort articles by date (newest first)
  const getSortedArticles = () => {
    return [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const value = {
    // Data
    articles: getSortedArticles(),
    articlesContent,
    loading,
    error,
    
    // Utility functions
    getArticleBySlug,
    getArticleContent,
    getArticleHTML,
    getArticlesByCategory,
    getFeaturedArticles,
    searchArticles,
    getCategories,
    getTags,
    
    // Refresh data
    refresh: () => {
      setLoading(true);
      setError(null);
      // Re-trigger useEffect
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Articles</h2>
          <p className="text-gray-600">Fetching blog content and metadata...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Blog</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <BlogDataContext.Provider value={value}>
      {children}
    </BlogDataContext.Provider>
  );
};

export default BlogDataProvider;