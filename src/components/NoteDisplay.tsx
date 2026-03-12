import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlockMath, InlineMath } from 'react-katex';
import { FileText, Download, Share2, Printer } from 'lucide-react';

interface NoteDisplayProps {
  content: string;
}

export const NoteDisplay: React.FC<NoteDisplayProps> = ({ content }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-academic-border overflow-hidden print:shadow-none print:border-none">
      <div className="bg-slate-50 border-b border-academic-border p-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 text-slate-600">
          <FileText size={20} />
          <span className="font-medium text-sm">Academic Manuscript</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
            title="Print or Save as PDF"
          >
            <Printer size={18} />
          </button>
          <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600">
            <Share2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-8 md:p-12 max-w-4xl mx-auto">
        <div className="markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const content = String(children).replace(/\n$/, '');
                
                // Check if it's a LaTeX block
                if (content.startsWith('$') && content.endsWith('$')) {
                  const math = content.slice(1, -1);
                  return inline ? <InlineMath math={math} /> : <BlockMath math={math} />;
                }
                
                return !inline ? (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-academic-accent font-mono text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              // Handle LaTeX in text
              p({ children }) {
                return <p>{processLatex(children)}</p>;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

// Helper to find and replace LaTeX markers in text
function processLatex(children: any): any {
  if (typeof children !== 'string') {
    if (Array.isArray(children)) {
      return children.map((child, i) => <React.Fragment key={i}>{processLatex(child)}</React.Fragment>);
    }
    return children;
  }

  const parts = children.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <BlockMath key={i} math={part.slice(2, -2)} />;
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={i} math={part.slice(1, -1)} />;
    }
    return part;
  });
}
