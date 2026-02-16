import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ImpactResult } from '@/types/analysis';
import { sampleFiles } from '@/data/sampleProject';

interface DependencyGraphProps {
  targetFile: string;
  impacts: ImpactResult[];
}

function FileNode({ data }: { data: { label: string; level: string; functions: string[]; tooltip: string } }) {
  const borderColor = {
    target: 'border-primary shadow-primary/20',
    direct: 'border-impact-danger shadow-impact-danger/10',
    indirect: 'border-impact-warning shadow-impact-warning/10',
    none: 'border-border',
  }[data.level] || 'border-border';

  const bgColor = {
    target: 'bg-primary/10',
    direct: 'bg-impact-danger-bg',
    indirect: 'bg-impact-warning-bg',
    none: 'bg-secondary/50',
  }[data.level] || 'bg-secondary/50';

  const textColor = {
    target: 'text-primary',
    direct: 'text-impact-danger',
    indirect: 'text-impact-warning',
    none: 'text-muted-foreground',
  }[data.level] || 'text-muted-foreground';

  const badge = {
    target: '🎯 수정 대상',
    direct: '🔴 직접 영향',
    indirect: '🟡 간접 영향',
    none: '🟢 영향 없음',
  }[data.level];

  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${borderColor} ${bgColor} shadow-lg min-w-[160px] group relative`}>
      <Handle type="target" position={Position.Top} className="!bg-border !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-border !w-2 !h-2" />
      <div className="text-[10px] mb-1 opacity-70">{badge}</div>
      <div className={`text-sm font-mono font-semibold ${textColor}`}>{data.label}</div>
      <div className="mt-1.5 space-y-0.5">
        {data.functions.slice(0, 3).map(fn => (
          <div key={fn} className="text-[10px] text-muted-foreground font-mono">
            ƒ {fn}()
          </div>
        ))}
        {data.functions.length > 3 && (
          <div className="text-[10px] text-muted-foreground">+{data.functions.length - 3} more</div>
        )}
      </div>
      {data.tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-50">
          {data.tooltip}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { fileNode: FileNode };

export default function DependencyGraph({ targetFile, impacts }: DependencyGraphProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getLevel = (fileName: string): string => {
    if (fileName === targetFile) return 'target';
    const impact = impacts.find(i => i.file === fileName);
    return impact?.level || 'none';
  };

  const getTooltip = (fileName: string): string => {
    const impact = impacts.find(i => i.file === fileName);
    return impact?.reason || '';
  };

  const positions: Record<string, { x: number; y: number }> = {
    'payment.js': { x: 300, y: 0 },
    'order.js': { x: 100, y: 160 },
    'refund.js': { x: 0, y: 330 },
    'notification.js': { x: 500, y: 160 },
    'logger.js': { x: 300, y: 330 },
    'auth.js': { x: 600, y: 330 },
  };

  const initialNodes: Node[] = sampleFiles.map(f => ({
    id: f.name,
    type: 'fileNode',
    position: positions[f.name] || { x: 0, y: 0 },
    data: {
      label: f.name,
      level: getLevel(f.name),
      functions: f.functions,
      tooltip: getTooltip(f.name),
    },
  }));

  const edgeDefs = [
    { s: 'payment.js', t: 'order.js', label: 'updateOrderStatus' },
    { s: 'payment.js', t: 'logger.js', label: 'logTransaction' },
    { s: 'payment.js', t: 'notification.js', label: 'sendAlert' },
    { s: 'order.js', t: 'refund.js', label: 'initiateRefund' },
    { s: 'order.js', t: 'logger.js', label: 'logTransaction' },
    { s: 'refund.js', t: 'logger.js', label: 'logTransaction' },
    { s: 'refund.js', t: 'notification.js', label: 'sendAlert' },
    { s: 'notification.js', t: 'logger.js', label: 'logTransaction' },
  ];

  const getEdgeColor = (source: string, target: string) => {
    const sLevel = getLevel(source);
    const tLevel = getLevel(target);
    if (sLevel === 'target' || tLevel === 'target') return 'hsl(217 91% 60%)';
    if (sLevel === 'direct' || tLevel === 'direct') return 'hsl(0 84% 60%)';
    if (sLevel === 'indirect' || tLevel === 'indirect') return 'hsl(38 92% 50%)';
    return 'hsl(240 12% 35%)';
  };

  const initialEdges: Edge[] = edgeDefs.map((e, i) => ({
    id: `e-${i}`,
    source: e.s,
    target: e.t,
    label: e.label,
    labelStyle: { fontSize: 10, fill: 'hsl(215 15% 55%)' },
    labelBgStyle: { fill: 'hsl(240 23% 15%)', fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    style: { stroke: getEdgeColor(e.s, e.t), strokeWidth: 1.5 },
    animated: getLevel(e.s) === 'target' || getLevel(e.t) === 'target',
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: getEdgeColor(e.s, e.t) },
  }));

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!visible) return null;

  return (
    <div className="w-full h-[400px] rounded-lg border border-border overflow-hidden animate-fade-in">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background gap={20} size={1} color="hsl(240 12% 20%)" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
