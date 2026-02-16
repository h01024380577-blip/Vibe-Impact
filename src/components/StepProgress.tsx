import { FileText, Search, CheckCircle, Rocket } from 'lucide-react';

const steps = [
  { icon: FileText, label: '프로젝트 & 요청', emoji: '📝' },
  { icon: Search, label: '영향 분석', emoji: '🔍' },
  { icon: CheckCircle, label: '의사결정', emoji: '✅' },
  { icon: Rocket, label: '결과 비교', emoji: '🚀' },
];

interface StepProgressProps {
  currentStep: 1 | 2 | 3 | 4;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {steps.map((step, i) => {
        const stepNum = (i + 1) as 1 | 2 | 3 | 4;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;

        return (
          <div key={i} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && (
              <div className={`w-6 sm:w-10 h-0.5 transition-colors duration-300 ${
                isDone ? 'bg-primary' : 'bg-border'
              }`} />
            )}
            <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              isActive
                ? 'bg-primary/20 text-primary border border-primary/40 glow-primary'
                : isDone
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
            }`}>
              <span>{step.emoji}</span>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">Step {stepNum}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
