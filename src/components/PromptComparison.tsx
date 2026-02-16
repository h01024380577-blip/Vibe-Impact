import { enhancedPrompts, problemPoints } from '@/data/analysisResults';
import { AlertTriangle, Check, X, Zap } from 'lucide-react';

interface PromptComparisonProps {
  originalPrompt: string;
  scenarioId: string;
  onShowDiff: () => void;
}

export default function PromptComparison({ originalPrompt, scenarioId, onShowDiff }: PromptComparisonProps) {
  const enhanced = enhancedPrompts[scenarioId] || '';
  const problems = problemPoints[scenarioId] || [];

  // Split enhanced prompt into original and context parts
  const contextStart = enhanced.indexOf('[자동 추가된 맥락 정보]');
  const originalPart = contextStart > 0 ? enhanced.slice(0, contextStart).trim() : enhanced;
  const contextPart = contextStart > 0 ? enhanced.slice(contextStart) : '';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Before */}
        <div className="rounded-xl border border-impact-danger/30 overflow-hidden">
          <div className="bg-impact-danger-bg px-4 py-3 border-b border-impact-danger/20">
            <div className="flex items-center gap-2 text-impact-danger font-semibold text-sm">
              <X className="w-4 h-4" />
              기존 바이브 코딩 — 맥락 없는 요청
            </div>
          </div>
          <div className="p-4 bg-impact-danger-bg/50">
            <div className="bg-code-bg rounded-lg p-4 font-mono text-xs text-foreground/90 border border-border">
              {originalPrompt}
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-impact-danger flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                이 프롬프트로 생성 시 예상 문제점:
              </div>
              {problems.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground ml-5">
                  <span className="text-impact-danger mt-0.5">•</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* After */}
        <div className="rounded-xl border border-impact-safe/30 overflow-hidden">
          <div className="bg-impact-safe-bg px-4 py-3 border-b border-impact-safe/20">
            <div className="flex items-center gap-2 text-impact-safe font-semibold text-sm">
              <Check className="w-4 h-4" />
              Vibe Impact — 맥락 인지 요청
            </div>
          </div>
          <div className="p-4 bg-impact-safe-bg/50">
            <div className="bg-code-bg rounded-lg p-4 font-mono text-xs text-foreground/90 border border-border space-y-3">
              <div>{originalPart}</div>
              {contextPart && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-primary/90 whitespace-pre-wrap leading-relaxed">
                  {contextPart}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onShowDiff}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all glow-primary"
      >
        <Zap className="w-4 h-4" />
        생성 결과 비교
      </button>
    </div>
  );
}
