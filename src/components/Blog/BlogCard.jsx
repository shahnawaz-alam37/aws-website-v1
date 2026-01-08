import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/markdownParser'

const BlogCard = ({ article, size = 'default' }) => {
  const cardClass = size === 'large' 
    ? 'md:flex md:items-center md:space-x-6' 
    : 'block'
  
  const imageClass = size === 'large' 
    ? 'md:w-1/2 h-64 md:h-80' 
    : 'w-full h-48'
  
  const contentClass = size === 'large' 
    ? 'md:w-1/2 mt-4 md:mt-0' 
    : 'mt-4'

  return (
    <Link
      to={`/post/${article.slug}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded-2xl"
    >
      <article className={`bg-gray-900/80 border border-gray-700/70 backdrop-blur-sm pb-8 mb-8 rounded-2xl overflow-hidden shadow-lg shadow-black/30 hover:border-indigo-400/70 hover:shadow-indigo-500/25 hover:-translate-y-1 transition-all duration-300 ${cardClass}`}>
      {article.thumbnail && (
        <div className={`${imageClass} bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-t-2xl`}>
          <img 
            src={article.thumbnail} 
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className={`p-6 ${contentClass}`}>
          
          <h2 className={`font-bold text-gray-50 mb-3 leading-tight font-lora ${size === 'large' ? 'text-2xl' : 'text-xl'} hover:text-indigo-300 transition-colors duration-200`}>
            {article.title}
          </h2>
        
          <p className="text-gray-300 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        
          <div className="flex items-center text-sm text-gray-400">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span className="mx-2">•</span>
            <span>{article.readingTime}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default BlogCard