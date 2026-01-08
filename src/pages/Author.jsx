import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBlogData } from '../components/Blog/BlogDataProvider'
import BlogCard from '../components/Blog/BlogCard'

const Author = () => {
  const { slug } = useParams()
  const { articles, loading: articlesLoading } = useBlogData()
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const res = await fetch('/Articles/authors.json', { headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error(`Failed to load authors (${res.status})`)
        const data = await res.json()
        const list = data.authors || data
        const match = list.find((a) => a.slug.toLowerCase() === slug.toLowerCase())
        if (!match) {
          setError('Author not found')
        } else {
          setAuthor(match)
        }
      } catch (err) {
        setError(err.message || 'Unable to load author')
      } finally {
        setLoading(false)
      }
    }

    fetchAuthor()
  }, [slug])

  const authoredArticles = articles.filter(
    (article) => (article.author?.slug || '').toLowerCase() === slug.toLowerCase()
  )

  if (loading || articlesLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading author...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-200 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Author</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/blogs" className="text-blue-300 hover:text-blue-200 font-medium">Back to blogs</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:pt-20">
        {/* Author header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-24 h-24 rounded-full object-cover border border-gray-700"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
            }}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-50 mb-2">{author.name}</h1>
            <p className="text-gray-300 mb-2">{author.tagline}</p>
            {author.location && <p className="text-sm text-gray-400">{author.location}</p>}
          </div>
        </div>

        {/* Bio */}
        {author.bio && (
          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 mb-10">
            <p className="text-gray-200 leading-relaxed">{author.bio}</p>
          </div>
        )}

        {/* Social links */}
        {author.social && (
          <div className="flex flex-wrap gap-4 mb-12">
            {author.social.twitter && (
              <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-100">Twitter</a>
            )}
            {author.social.github && (
              <a href={author.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">GitHub</a>
            )}
            {author.social.linkedin && (
              <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-blue-100">LinkedIn</a>
            )}
            {author.social.website && (
              <a href={author.social.website} target="_blank" rel="noopener noreferrer" className="text-green-300 hover:text-green-200">Website</a>
            )}
          </div>
        )}

        {/* Articles */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-50">Articles by {author.name}</h2>
            {/* <Link to="/blogs" className="text-blue-300 hover:text-blue-200 text-sm font-medium">View all</Link> */}
          </div>

          {authoredArticles.length === 0 ? (
            <p className="text-gray-400">No articles found for this author.</p>
          ) : (
            authoredArticles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Author
