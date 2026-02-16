import { useState } from 'react';
import { ProjectFile } from '@/types/analysis';
import { FileCode, ChevronRight, Folder } from 'lucide-react';

interface CodeEditorProps {
  files: ProjectFile[];
  activeFile: string;
  onFileSelect: (name: string) => void;
  highlightFunction?: string;
}

export default function CodeEditor({ files, activeFile, onFileSelect, highlightFunction }: CodeEditorProps) {
  const file = files.find(f => f.name === activeFile);

  return (
    <div className="flex flex-col h-full rounded-lg border border-border overflow-hidden bg-code-bg">
      {/* File tabs */}
      <div className="flex items-center gap-0.5 bg-secondary/50 px-2 py-1 overflow-x-auto border-b border-border">
        <Folder className="w-3.5 h-3.5 text-muted-foreground mr-1.5 flex-shrink-0" />
        {files.map(f => (
          <button
            key={f.name}
            onClick={() => onFileSelect(f.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-mono whitespace-nowrap transition-colors ${
              f.name === activeFile
                ? 'bg-code-bg text-foreground border-t-2 border-t-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <FileCode className="w-3 h-3" />
            {f.name}
          </button>
        ))}
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto p-0">
        {file && (
          <pre className="text-xs leading-6 font-mono">
            {file.content.split('\n').map((line, i) => {
              const isHighlighted = highlightFunction && line.includes(highlightFunction);
              return (
                <div
                  key={i}
                  className={`flex ${isHighlighted ? 'bg-primary/10 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
                >
                  <span className="w-10 text-right pr-3 text-code-gutter select-none flex-shrink-0">
                    {i + 1}
                  </span>
                  <code className="text-foreground/90 pr-4">
                    {colorize(line)}
                  </code>
                </div>
              );
            })}
          </pre>
        )}
      </div>
    </div>
  );
}

function colorize(line: string) {
  // Simple syntax highlighting
  return line
    .replace(/(import|export|from|function|const|let|var|if|else|try|catch|throw|new|return|typeof)/g, '\u001BKEYWORD$1\u001BEND')
    .replace(/('([^']*)'|"([^"]*)")/g, '\u001BSTRING$1\u001BEND')
    .replace(/(\/\/.*)/g, '\u001BCOMMENT$1\u001BEND')
    .split('\u001B')
    .map((part, i) => {
      if (part.startsWith('KEYWORD')) return <span key={i} className="text-syntax-keyword">{part.slice(7).replace('END', '')}</span>;
      if (part.startsWith('STRING')) return <span key={i} className="text-syntax-string">{part.slice(6).replace('END', '')}</span>;
      if (part.startsWith('COMMENT')) return <span key={i} className="text-syntax-comment">{part.slice(7).replace('END', '')}</span>;
      return <span key={i}>{part.replace('END', '')}</span>;
    });
}
