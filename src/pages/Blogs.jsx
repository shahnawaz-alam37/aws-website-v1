import React from 'react'
import { useBlogData } from '../components/Blog/BlogDataProvider'
import BlogCard from '../components/Blog/BlogCard'

const Blogs = () => {
  const { 
    articles, 
    getFeaturedArticles, 
    loading, 
    error 
  } = useBlogData()

  // Get featured articles (first 3)
  const featuredArticles = getFeaturedArticles().slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Articles</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="border-b border-gray-700 py-16 pt-20" style={{marginBottom: '-1px'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4 font-lora text-gray-50">
            Cloud Chronicles – AWSCC MJCET 
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the latest insights in AWS, AI and technology
          </p>
        </div>
      </section>

      {/* Featured Articles Section (if any exist) */}
      {featuredArticles.length > 0 && (
        <section className="py-12 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-8 text-center">
              Featured Articles
            </h2>
            <div className="space-y-6">
              {featuredArticles.map((article) => (
                <BlogCard 
                  key={article.slug} 
                  article={article} 
                  featured={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles Section  */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-8 text-center">
            {featuredArticles.length > 0 ? 'All Articles' : 'Latest Articles'}
          </h2>
          
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">No articles found. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-0">
              {articles.map((article) => (
                <BlogCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Blogs