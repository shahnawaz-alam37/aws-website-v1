import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBlogData } from '../components/Blog/BlogDataProvider'

const BlogPost = () => {
  const { slug } = useParams()
  const { 
    getArticleBySlug, 
    getArticleHTML, 
    loading, 
    error 
  } = useBlogData()

  // Get the article by slug
  const article = getArticleBySlug(slug)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-32 mb-6"></div>
            <div className="h-64 bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Article</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Link 
              to="/blogs"
              className="text-blue-400 hover:text-blue-200 font-medium"
            >
              ← Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Article Not Found</h2>
            <p className="text-gray-300 mb-4">The article you're looking for doesn't exist.</p>
            <Link 
              to="/blogs"
              className="text-blue-400 hover:text-blue-200 font-medium"
            >
              ← Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get the parsed HTML content
  const htmlContent = getArticleHTML(article.id)

  return (
    <article className="min-h-screen bg-gray-900 py-12 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="mb-8">
          <Link 
            to="/blogs"
            className="inline-flex items-center text-blue-300 hover:text-blue-100 font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </Link>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          {/* Banner Image */}
          {article.banner && (
            <img 
              src={article.banner} 
              alt={article.title}
              loading="lazy"
              decoding="async"
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg mb-8"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop';
              }}
            />
          )}
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
            <span className="bg-blue-900/40 text-blue-100 px-3 py-1 rounded-full font-medium">
              {article.category}
            </span>
            <time dateTime={article.date} className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {new Date(article.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
            {article.readTime && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {article.readTime}
              </span>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-50 leading-tight mb-6 font-lora">
            {article.title}
          </h1>
          
          {/* Excerpt */}
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            {article.excerpt}
          </p>

          {/* Author Info */}
          <div className="flex items-center">
            <img 
              src={article.author.avatar} 
              alt={article.author.name}
              loading="lazy"
              decoding="async"
              className="w-12 h-12 rounded-full mr-4"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
              }}
            />
            <div>
              <Link 
                to={`/author/${article.author.slug}`}
                className="font-semibold text-gray-100 hover:text-blue-300 transition-colors"
              >
                {article.author.name}
              </Link>
              <p className="text-sm text-gray-400">{article.author.tagline}</p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg prose-invert max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-gray-800 text-gray-100 text-sm rounded-full hover:bg-gray-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <img 
              src={article.author.avatar} 
              alt={article.author.name}
              loading="lazy"
              decoding="async"
              className="w-20 h-20 rounded-full mb-4 sm:mb-0 sm:mr-6"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-100 mb-2">
                <Link 
                  to={`/author/${article.author.slug}`}
                  className="hover:text-blue-300 transition-colors"
                >
                  {article.author.name}
                </Link>
              </h3>
              <p className="text-gray-400 mb-4">{article.author.tagline}</p>
              {article.author.bio && (
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {article.author.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                {article.author.social.twitter && (
                  <a 
                    href={article.author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-100 transition-colors"
                  >
                    Twitter
                  </a>
                )}
                {article.author.social.github && (
                  <a 
                    href={article.author.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                )}
                {article.author.social.linkedin && (
                  <a 
                    href={article.author.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-100 transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {article.author.social.website && (
                  <a 
                    href={article.author.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 hover:text-green-100 transition-colors"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {/* <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="text-sm font-medium text-gray-900">Share this article:</span>
              <div className="flex space-x-3">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div> */}
            
            <Link 
              to="/blogs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
            >
              More Articles
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogPost