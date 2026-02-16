import { Play, ChevronDown } from 'lucide-react';
import { scenarios } from '@/data/sampleProject';

interface RequestInputProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  onAnalyze: () => void;
  scenarioId: string;
  onScenarioChange: (id: string) => void;
}

export default function RequestInput({ prompt, onPromptChange, onAnalyze, scenarioId, onScenarioChange }: RequestInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">수정 요청</label>
        <select
          value={scenarioId}
          onChange={e => onScenarioChange(e.target.value)}
          className="ml-auto text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {scenarios.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
      <textarea
        value={prompt}
        onChange={e => onPromptChange(e.target.value)}
        rows={3}
        className="w-full bg-code-bg border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground"
        placeholder="자연어로 수정 요청을 입력하세요..."
      />
      <button
        onClick={onAnalyze}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all glow-primary hover:shadow-lg hover:shadow-primary/20"
      >
        <Play className="w-4 h-4" />
        분석 시작
      </button>
    </div>
  );
}
