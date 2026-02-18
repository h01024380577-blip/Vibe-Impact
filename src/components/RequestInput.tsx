import { Play, Lightbulb } from 'lucide-react';
import { scenarios } from '@/data/sampleProject';

interface RequestInputProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  onAnalyze: () => void;
  scenarioId: string;
  onScenarioChange: (id: string) => void;
}

export default function RequestInput({ prompt, onPromptChange, onAnalyze, scenarioId, onScenarioChange }: RequestInputProps) {
  const applyExample = (id: string) => {
    onScenarioChange(id);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">수정 요청</label>
      <textarea
        value={prompt}
        onChange={e => onPromptChange(e.target.value)}
        rows={4}
        className="w-full bg-code-bg border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground"
        placeholder="자연어로 수정 요청을 입력하세요... 예: handlePaymentError 함수에 재시도 로직을 추가해줘"
      />
      
      {/* Example scenario chips */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="w-3 h-3" />
          예시 시나리오:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => applyExample(s.id)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                scenarioId === s.id
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onAnalyze}
        disabled={!prompt.trim()}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all glow-primary hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play className="w-4 h-4" />
        분석 시작
      </button>
    </div>
  );
}
