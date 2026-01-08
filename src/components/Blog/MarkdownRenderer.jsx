import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';


import { Children } from "react";

function extractText(children) {
  return Children.toArray(children).map(c => {
    if (typeof c === "string") return c;
    if (typeof c === "number") return String(c);
    return ""; // ignore objects/nodes
  }).join("");
}
/**
 * Copy Button Component for Code Blocks
 */
const CopyButton = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 opacity-0 group-hover:opacity-100"
      title="Copy code"
    >
      {copied ? (
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Copied!
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy
        </span>
      )}
    </button>
  );
};

/**
 * Share Button Component
 */
const ShareButton = ({ title, url }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareRef = useRef(null);

  const shareOptions = [
    {
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
      }
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      action: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank');
      }
    },
    {
      name: 'Copy Link',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
      ),
      action: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setShowShareMenu(false);
        } catch (error) {
          console.error('Failed to copy URL:', error);
        }
      }
    }
  ];

  return (
    <div className="relative" ref={shareRef}>
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        Share
      </button>

      {showShareMenu && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-50">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200"
            >
              {option.icon}
              <span className="text-gray-700">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Custom Components for ReactMarkdown
 */
const markdownComponents = {
  // Custom code block with copy button
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const codeContent = String(children).replace(/\n$/, '');

    if (!inline) {
      return (
        <div className="relative group">
          <div className="flex items-center justify-between bg-gray-800 text-sm">
            <span className="text-gray-400">{language || 'code'}</span>
            <CopyButton content={codeContent} />
          </div>
          <pre className="!mt-0 !rounded-t-none overflow-x-auto"
          style={{
            padding:"0",
          }}
          {...props}>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }

    return (
      <code
        className="bg-gray-100 text-gray-800 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Custom blockquote styling
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-blue-500 my-6 bg-blue-50 italic text-gray-700 rounded-r-lg">
        {children}
      </blockquote>
    );
  },

  // Custom image with zoom functionality - Medium style
  img({ src, alt, ...props }) {
    const [showZoom, setShowZoom] = useState(false);

    return (
      <>
        <div className="my-8 text-center">
          <img
            src={src}
            alt={alt}
            className="inline-block max-w-full h-auto max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity duration-300 rounded-sm"
            onClick={() => setShowZoom(true)}
            {...props}
          />
          {alt && (
            <figcaption className="text-sm text-gray-500 mt-2 italic">{alt}</figcaption>
          )}
        </div>
        
        {showZoom && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setShowZoom(false)}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setShowZoom(false)}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </>
    );
  },

  // Custom table styling
  table({ children }) {
    return (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    );
  },

  th({ children }) {
    return (
      <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-900">
        {children}
      </th>
    );
  },

  td({ children }) {
    return (
      <td className="border border-gray-300 px-4 py-2 text-gray-700">
        {children}
      </td>
    );
  },

  // Custom heading with anchor links
  h1({ children }) {
    const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
    return (
      <h1 id={id} className="text-4xl font-bold text-gray-900 mb-6 mt-8 font-lora">
        {children}
      </h1>
    );
  },

  h2({ children }) {
    const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
    return (
      <h2 id={id} className="text-3xl font-semibold text-gray-900 mb-4 mt-8 font-lora">
        {children}
      </h2>
    );
  },

  h3({ children }) {
    const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
    return (
      <h3 id={id} className="text-2xl font-semibold text-gray-900 mb-3 mt-6 font-lora">
        {children}
      </h3>
    );
  },

  // Custom paragraph styling
  p({ children }) {
    return (
      <p className="text-gray-700 leading-relaxed mb-4 text-lg">
        {children}
      </p>
    );
  },

  // Custom list styling
  ul({ children }) {
    return (
      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
        {children}
      </ul>
    );
  },

  ol({ children }) {
    return (
      <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-2">
        {children}
      </ol>
    );
  },

  li({ children }) {
    return (
      <li className="text-lg leading-relaxed">
        {children}
      </li>
    );
  }
};

/**
 * Main Markdown Renderer Component
 */
const MarkdownRenderer = ({ content, title, showShare = true, showTopShare = false }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const stripLeadingTitle = (rawContent, headingTitle) => {
    if (!rawContent) return rawContent;
    const trimmed = rawContent.replace(/^\uFEFF/, '');
    const lines = trimmed.replace(/^\s+/, '').split('\n');
    if (lines.length === 0) return rawContent;

    const firstLine = lines[0];
    const normalizedFirst = firstLine.replace(/^#+\s*/, '').trim();
    const normalizedTitle = (headingTitle || '').trim();

    if (normalizedTitle && normalizedFirst.toLowerCase() === normalizedTitle.toLowerCase()) {
      // remove the first line (the duplicate title)
      let startIndex = 1;
      // also remove a following empty line if present for cleaner spacing
      if (lines[startIndex] !== undefined && lines[startIndex].trim() === '') {
        startIndex += 1;
      }
      return lines.slice(startIndex).join('\n');
    }

    return rawContent;
  };

  const cleanedContent = stripLeadingTitle(content, title);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Share button at the top (optional) */}
      {showTopShare && (
        <div className="flex justify-end mb-6">
          <ShareButton title={title} url={currentUrl} />
        </div>
      )}

      {/* Markdown content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={markdownComponents}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>

      {/* Share button at the bottom */}
      {showShare && (
        <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
          <ShareButton title={title} url={currentUrl} />
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;