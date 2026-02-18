import { sampleFiles } from '@/data/sampleProject';
import { Crosshair } from 'lucide-react';

interface TargetSelectorProps {
  targetFile: string;
  targetFunction: string;
  onChangeTarget: (file: string, fn: string) => void;
}

export default function TargetSelector({ targetFile, targetFunction, onChangeTarget }: TargetSelectorProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Crosshair className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">수정 대상 변경</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sampleFiles.map(file => (
          <div key={file.name} className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-mono">{file.name}</div>
            <div className="flex flex-wrap gap-1">
              {file.functions.map(fn => {
                const isActive = file.name === targetFile && fn === targetFunction;
                return (
                  <button
                    key={fn}
                    onClick={() => onChangeTarget(file.name, fn)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all ${
                      isActive
                        ? 'bg-primary/20 border-primary/40 text-primary glow-primary'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    ƒ {fn}()
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
