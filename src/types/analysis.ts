export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  functions: string[];
}

export type ImpactLevel = 'direct' | 'indirect' | 'none';

export interface ImpactResult {
  file: string;
  function: string;
  level: ImpactLevel;
  reason: string;
}

export interface AnalysisState {
  step: 1 | 2 | 3 | 4;
  targetFunction: string;
  targetFile: string;
  prompt: string;
  impacts: ImpactResult[];
  isAnalyzing: boolean;
  analysisPhase: 'idle' | 'scanning' | 'parsing' | 'tracking' | 'reporting' | 'done';
  excludedFiles: string[];
  showDiff: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  file: string;
  functions: string[];
  level: ImpactLevel | 'target';
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'import' | 'call';
}
