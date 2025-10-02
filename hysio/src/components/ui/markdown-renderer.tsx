'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Professional Clinical Markdown Renderer
 * Renders markdown with proper medical documentation styling
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Headers
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-hysio-deep-green mb-6 pb-3 border-b-2 border-hysio-mint" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4 flex items-center gap-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-hysio-deep-green-900 mt-6 mb-3" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold text-hysio-deep-green-900 mt-4 mb-2" {...props} />
          ),

          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-hysio-deep-green-900/90 leading-relaxed mb-4" {...props} />
          ),

          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-hysio-deep-green-900/90" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-hysio-deep-green-900/90" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2" {...props} />
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-300 border border-gray-300" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-hysio-mint/20" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-200 bg-white" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-hysio-mint/5 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-hysio-deep-green" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-hysio-deep-green-900/90 whitespace-normal" {...props} />
          ),

          // Emphasis
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-hysio-deep-green-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-hysio-deep-green-900/80" {...props} />
          ),

          // Code (for technical notes)
          code: ({ node, ...props }) => (
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-gray-800" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm mb-4" {...props} />
          ),

          // Horizontal rules
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t-2 border-hysio-mint/30" {...props} />
          ),

          // Blockquotes (for clinical notes)
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-hysio-mint pl-4 py-2 my-4 bg-hysio-mint/5 italic text-hysio-deep-green-900/80" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Section card wrapper for clinical sections
 */
export function ClinicalSection({ title, children, icon, className = '' }: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-hysio-mint/20 rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-hysio-mint/10 to-hysio-mint/5 px-6 py-4 border-b border-hysio-mint/20">
        <div className="flex items-center gap-3">
          {icon && <div className="text-hysio-deep-green">{icon}</div>}
          <h2 className="text-xl font-bold text-hysio-deep-green">{title}</h2>
        </div>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}
