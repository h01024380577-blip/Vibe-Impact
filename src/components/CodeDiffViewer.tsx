import { beforeCode, afterCode } from '@/data/analysisResults';
import { X, Check } from 'lucide-react';

interface CodeDiffViewerProps {
  scenarioId: string;
}

export default function CodeDiffViewer({ scenarioId }: CodeDiffViewerProps) {
  const before = beforeCode[scenarioId] || '';
  const after = afterCode[scenarioId] || '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
      <DiffPane
        title="기존 방식 — 문제 있는 코드"
        icon={<X className="w-4 h-4" />}
        code={before}
        variant="danger"
      />
      <DiffPane
        title="Vibe Impact — 안전한 코드"
        icon={<Check className="w-4 h-4" />}
        code={after}
        variant="safe"
      />
    </div>
  );
}

function DiffPane({ title, icon, code, variant }: {
  title: string;
  icon: React.ReactNode;
  code: string;
  variant: 'danger' | 'safe';
}) {
  const colors = variant === 'danger'
    ? { border: 'border-impact-danger/30', header: 'bg-impact-danger-bg', headerText: 'text-impact-danger' }
    : { border: 'border-impact-safe/30', header: 'bg-impact-safe-bg', headerText: 'text-impact-safe' };

  return (
    <div className={`rounded-xl border ${colors.border} overflow-hidden`}>
      <div className={`${colors.header} px-4 py-2.5 border-b ${colors.border}`}>
        <div className={`flex items-center gap-2 ${colors.headerText} font-semibold text-xs`}>
          {icon}
          {title}
        </div>
      </div>
      <div className="bg-code-bg overflow-auto max-h-[500px]">
        <pre className="text-xs leading-6 font-mono p-0">
          {code.split('\n').map((line, i) => {
            const isComment = line.trim().startsWith('//');
            const isWarning = line.includes('⚠️');
            const isGood = line.includes('✅');
            
            return (
              <div
                key={i}
                className={`flex ${
                  isWarning ? 'bg-impact-danger/5' : isGood ? 'bg-impact-safe/5' : ''
                }`}
              >
                <span className="w-8 text-right pr-2 text-code-gutter select-none flex-shrink-0 text-[11px]">
                  {i + 1}
                </span>
                <code className={`pr-4 ${
                  isComment 
                    ? isWarning ? 'text-impact-danger/70' : isGood ? 'text-impact-safe/70' : 'text-syntax-comment'
                    : 'text-foreground/90'
                }`}>
                  {line}
                </code>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
