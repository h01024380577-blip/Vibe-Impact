import { ImpactResult } from '@/types/analysis';
import { AlertTriangle, ShieldAlert, ShieldCheck, Info } from 'lucide-react';

interface AnalysisReportProps {
  targetFile: string;
  targetFunction: string;
  impacts: ImpactResult[];
}

export default function AnalysisReport({ targetFile, targetFunction, impacts }: AnalysisReportProps) {
  const direct = impacts.filter(i => i.level === 'direct');
  const indirect = impacts.filter(i => i.level === 'indirect');
  const none = impacts.filter(i => i.level === 'none');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">변경 영향 분석 리포트</h3>
      </div>

      <div className="bg-code-bg rounded-lg border border-border p-4 font-mono text-xs space-y-1">
        <div className="text-muted-foreground">수정 대상: <span className="text-primary">{targetFile}</span> {'>'} <span className="text-syntax-function">{targetFunction}()</span></div>
      </div>

      {/* Direct impacts */}
      {direct.length > 0 && (
        <ImpactSection
          icon={<ShieldAlert className="w-4 h-4 text-impact-danger" />}
          title={`직접 영향 (높은 위험) — ${direct.length}건`}
          items={direct}
          borderColor="border-impact-danger/30"
          bgColor="bg-impact-danger-bg"
          dotColor="bg-impact-danger"
        />
      )}

      {/* Indirect impacts */}
      {indirect.length > 0 && (
        <ImpactSection
          icon={<AlertTriangle className="w-4 h-4 text-impact-warning" />}
          title={`간접 영향 (중간 위험) — ${indirect.length}건`}
          items={indirect}
          borderColor="border-impact-warning/30"
          bgColor="bg-impact-warning-bg"
          dotColor="bg-impact-warning"
        />
      )}

      {/* No impact */}
      {none.length > 0 && (
        <ImpactSection
          icon={<ShieldCheck className="w-4 h-4 text-impact-safe" />}
          title={`영향 없음 — ${none.length}건`}
          items={none}
          borderColor="border-impact-safe/30"
          bgColor="bg-impact-safe-bg"
          dotColor="bg-impact-safe"
        />
      )}

      {direct.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-impact-warning-bg border border-impact-warning/20 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-impact-warning mt-0.5 flex-shrink-0" />
          <span className="text-impact-warning">
            권장사항: {direct[0].file}의 {direct[0].level === 'direct' ? '관련 플로우' : '의존성'}을 함께 검토하세요.
          </span>
        </div>
      )}
    </div>
  );
}

function ImpactSection({
  icon,
  title,
  items,
  borderColor,
  bgColor,
  dotColor,
}: {
  icon: React.ReactNode;
  title: string;
  items: ImpactResult[];
  borderColor: string;
  bgColor: string;
  dotColor: string;
}) {
  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-3 space-y-2`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
        {icon}
        {title}
      </div>
      {items.map((item, i) => (
        <div key={i} className="ml-6 flex items-start gap-2 text-xs">
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
          <div>
            <span className="text-foreground font-medium">{item.file}</span>
            <span className="text-muted-foreground"> {'>'} </span>
            <span className="text-syntax-function">{item.function}</span>
            <p className="text-muted-foreground mt-0.5 leading-relaxed">→ {item.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
