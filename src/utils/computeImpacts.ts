import { ImpactResult } from '@/types/analysis';
import { sampleFiles } from '@/data/sampleProject';

// Dependency graph: source → targets (source calls target)
const dependencyEdges: { source: string; target: string; label: string }[] = [
  { source: 'payment.js', target: 'order.js', label: 'updateOrderStatus' },
  { source: 'payment.js', target: 'logger.js', label: 'logTransaction' },
  { source: 'payment.js', target: 'notification.js', label: 'sendAlert' },
  { source: 'order.js', target: 'refund.js', label: 'initiateRefund' },
  { source: 'order.js', target: 'logger.js', label: 'logTransaction' },
  { source: 'refund.js', target: 'logger.js', label: 'logTransaction' },
  { source: 'refund.js', target: 'notification.js', label: 'sendAlert' },
  { source: 'notification.js', target: 'logger.js', label: 'logTransaction' },
];

export function computeImpacts(targetFile: string, targetFunction: string): ImpactResult[] {
  const allFiles = sampleFiles.map(f => f.name).filter(f => f !== targetFile);

  // Direct: files that target directly calls, or files that directly call target
  const directFiles = new Set<string>();
  const directReasons = new Map<string, string>();

  for (const edge of dependencyEdges) {
    if (edge.source === targetFile) {
      directFiles.add(edge.target);
      directReasons.set(
        edge.target,
        `${targetFunction}()에서 ${edge.label}()을 직접 호출합니다. 수정 시 이 호출에 영향을 줄 수 있습니다.`
      );
    }
    if (edge.target === targetFile) {
      directFiles.add(edge.source);
      directReasons.set(
        edge.source,
        `${edge.source}의 ${edge.label}()이 ${targetFile}을 직접 호출합니다. 인터페이스 변경 시 영향 받습니다.`
      );
    }
  }

  // Indirect: files reachable within 2 hops but not direct
  const indirectFiles = new Set<string>();
  const indirectReasons = new Map<string, string>();

  for (const df of directFiles) {
    for (const edge of dependencyEdges) {
      if (edge.source === df && !directFiles.has(edge.target) && edge.target !== targetFile) {
        indirectFiles.add(edge.target);
        indirectReasons.set(
          edge.target,
          `${df}를 통해 간접적으로 연결됩니다. ${df} > ${edge.label}() 호출 체인에 영향 가능`
        );
      }
      if (edge.target === df && !directFiles.has(edge.source) && edge.source !== targetFile) {
        indirectFiles.add(edge.source);
        indirectReasons.set(
          edge.source,
          `${df}를 통해 간접적으로 연결됩니다. 의존성 체인에 영향 가능`
        );
      }
    }
  }

  const results: ImpactResult[] = [];

  for (const file of allFiles) {
    const fileData = sampleFiles.find(f => f.name === file);
    const mainFn = fileData?.functions[0] || file;

    if (directFiles.has(file)) {
      results.push({
        file,
        function: mainFn,
        level: 'direct',
        reason: directReasons.get(file) || '직접 의존 관계가 있습니다.',
      });
    } else if (indirectFiles.has(file)) {
      results.push({
        file,
        function: mainFn,
        level: 'indirect',
        reason: indirectReasons.get(file) || '간접 의존 관계가 있습니다.',
      });
    } else {
      results.push({
        file,
        function: mainFn,
        level: 'none',
        reason: `${targetFile} 모듈과 의존 관계 없음`,
      });
    }
  }

  // Sort: direct first, then indirect, then none
  const order = { direct: 0, indirect: 1, none: 2 };
  results.sort((a, b) => order[a.level] - order[b.level]);

  return results;
}
