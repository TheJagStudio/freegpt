import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { formatLatexEquation } from '../utils/mathUtils';

import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

export function MarkdownRenderer({ content, isDarkTheme }) {
    // Format any LaTeX equations in the content
    let formattedContent = content.replace(
        /\\\[(.*?)\\\]/gs,
        (_, equation) => `$$${formatLatexEquation(equation)}$$`
    );
    
    formattedContent = formattedContent.replace(
        /\\\((.*?)\\\)/gs,
        (_, equation) => `$${formatLatexEquation(equation)}$`
    );
    
    // Ensure no trailing `\$$` exists after replacements
    formattedContent = formattedContent.replaceAll('\\$$', '$$');
    return (
        <ReactMarkdown
            components={{
                code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                        <SyntaxHighlighter children={String(children).replace(/\n$/, "")} style={isDarkTheme ? vscDarkPlus : vs} language={match[1]} PreTag="div" {...props} />
                    ) : (
                        <code className={className} style={{ color: "white !important" }} {...props}>
                            {children}
                        </code>
                    );
                },
                math: ({ value }) => (
                    <div className="my-4 overflow-x-auto">
                        {value}
                    </div>
                ),
            }}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
        >
            {formattedContent}
        </ReactMarkdown>
    );
}