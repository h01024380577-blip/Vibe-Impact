import { AnalysisState } from '@/types/analysis';
import { Loader2, ScanSearch, FileCode, GitBranch, FileCheck } from 'lucide-react';

const phases = [
  { key: 'scanning', label: '파일 스캐닝', icon: ScanSearch, description: '프로젝트 파일을 검색하고 있습니다...' },
  { key: 'parsing', label: 'AST 파싱', icon: FileCode, description: '구문 트리를 분석하고 있습니다...' },
  { key: 'tracking', label: '의존성 추적', icon: GitBranch, description: 'import/export 관계를 추적하고 있습니다...' },
  { key: 'reporting', label: '리포트 생성', icon: FileCheck, description: '영향 분석 리포트를 생성하고 있습니다...' },
];

interface AnalysisAnimationProps {
  phase: AnalysisState['analysisPhase'];
}

export default function AnalysisAnimation({ phase }: AnalysisAnimationProps) {
  if (phase === 'idle' || phase === 'done') return null;

  const currentIndex = phases.findIndex(p => p.key === phase);

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>

      <div className="space-y-3 w-full max-w-sm">
        {phases.map((p, i) => {
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;
          const Icon = p.icon;

          return (
            <div
              key={p.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 ${
                isActive
                  ? 'bg-primary/10 border border-primary/30 scale-[1.02]'
                  : isDone
                    ? 'bg-impact-safe-bg border border-impact-safe/20'
                    : 'bg-secondary/30 border border-transparent opacity-40'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${
                isActive ? 'text-primary animate-pulse-soft' : isDone ? 'text-impact-safe' : 'text-muted-foreground'
              }`} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${
                  isActive ? 'text-primary' : isDone ? 'text-impact-safe' : 'text-muted-foreground'
                }`}>
                  {p.label}
                  {isDone && ' ✓'}
                </div>
                {isActive && (
                  <div className="text-xs text-muted-foreground mt-0.5">{p.description}</div>
                )}
              </div>
              {isActive && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
