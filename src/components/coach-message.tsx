import React from 'react';
import Markdown from 'react-markdown';

export function CoachMessage({ content }: { content: string }) {
  return (
    <div className="coach-prose">
      <Markdown
        skipHtml
        allowedElements={[
          'p',
          'h1',
          'h2',
          'h3',
          'h4',
          'strong',
          'em',
          'ul',
          'ol',
          'li',
          'blockquote',
          'br',
          'a',
          'code',
          'pre',
          'hr',
        ]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
