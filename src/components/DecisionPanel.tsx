import { useState } from 'react';
import { ImpactResult } from '@/types/analysis';
import { Check, Settings, X, ArrowRight } from 'lucide-react';

interface DecisionPanelProps {
  impacts: ImpactResult[];
  excludedFiles: string[];
  onToggleExclude: (file: string) => void;
  onProceed: () => void;
  onCancel: () => void;
}

export default function DecisionPanel({ impacts, excludedFiles, onToggleExclude, onProceed, onCancel }: DecisionPanelProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3 animate-fade-in">
        <button
          onClick={onProceed}
          className="flex-1 min-w-[140px] flex flex-col items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-lg transition-all glow-primary hover:shadow-lg hover:shadow-primary/20"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            진행 (Proceed)
          </div>
          <span className="text-[10px] font-normal opacity-80">영향 분석 결과를 AI 프롬프트에 자동 포함</span>
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="flex-1 min-w-[140px] flex flex-col items-center gap-1.5 bg-impact-warning/20 hover:bg-impact-warning/30 text-impact-warning border border-impact-warning/30 font-semibold py-4 px-6 rounded-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            범위 조정
          </div>
          <span className="text-[10px] font-normal opacity-80">특정 파일을 수정 범위에서 제외</span>
        </button>

        <button
          onClick={onCancel}
          className="flex-1 min-w-[140px] flex flex-col items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground border border-border font-semibold py-4 px-6 rounded-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <X className="w-4 h-4" />
            취소
          </div>
          <span className="text-[10px] font-normal opacity-80">분석을 취소하고 처음으로</span>
        </button>
      </div>

      {/* Scope adjustment modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">수정 범위 조정</h3>
            <p className="text-xs text-muted-foreground mb-4">수정하지 않을 파일을 선택 해제하세요.</p>
            <div className="space-y-2 mb-6">
              {impacts.filter(i => i.level !== 'none').map(impact => (
                <label
                  key={impact.file}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border cursor-pointer hover:bg-secondary/70 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!excludedFiles.includes(impact.file)}
                    onChange={() => onToggleExclude(impact.file)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-mono text-foreground">{impact.file}</span>
                    <span className={`ml-2 text-xs ${
                      impact.level === 'direct' ? 'text-impact-danger' : 'text-impact-warning'
                    }`}>
                      {impact.level === 'direct' ? '🔴 직접 영향' : '🟡 간접 영향'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); onProceed(); }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors"
              >
                적용 <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-secondary text-muted-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
