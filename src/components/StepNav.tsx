import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavProps {
  currentStep: 1 | 2 | 3 | 4;
  onGoToStep: (step: 1 | 2 | 3 | 4) => void;
  /** Whether analysis has completed (impacts loaded) — gates forward from step 1 */
  hasResults: boolean;
}

const stepLabels = ['프로젝트 & 요청', '영향 분석', '의사결정', '결과 비교'];

export default function StepNav({ currentStep, onGoToStep, hasResults }: StepNavProps) {
  const canGoBack = currentStep > 1;
  const canGoForward = currentStep < 4 && hasResults;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
      <button
        onClick={() => onGoToStep((currentStep - 1) as 1 | 2 | 3 | 4)}
        disabled={!canGoBack}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4" />
        {canGoBack ? stepLabels[currentStep - 2] : '이전'}
      </button>
      <span className="text-xs text-muted-foreground">
        {currentStep} / 4 — {stepLabels[currentStep - 1]}
      </span>
      <button
        onClick={() => onGoToStep((currentStep + 1) as 1 | 2 | 3 | 4)}
        disabled={!canGoForward}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {canGoForward ? stepLabels[currentStep] : '다음'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
