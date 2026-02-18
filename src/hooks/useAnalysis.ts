import { useState, useCallback } from 'react';
import { AnalysisState } from '@/types/analysis';
import { scenarioImpacts } from '@/data/analysisResults';
import { scenarios } from '@/data/sampleProject';
import { computeImpacts } from '@/utils/computeImpacts';

const initialState: AnalysisState = {
  step: 1,
  targetFunction: 'handlePaymentError',
  targetFile: 'payment.js',
  prompt: scenarios[0].prompt,
  impacts: [],
  isAnalyzing: false,
  analysisPhase: 'idle',
  excludedFiles: [],
  showDiff: false,
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(initialState);
  const [scenarioId, setScenarioId] = useState('retry');

  const selectScenario = useCallback((id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;
    setScenarioId(id);
    setState(prev => ({
      ...prev,
      step: 1,
      targetFunction: scenario.targetFunction,
      targetFile: scenario.targetFile,
      prompt: scenario.prompt,
      impacts: [],
      isAnalyzing: false,
      analysisPhase: 'idle',
      excludedFiles: [],
      showDiff: false,
    }));
  }, []);

  const startAnalysis = useCallback(() => {
    setState(prev => ({ ...prev, isAnalyzing: true, analysisPhase: 'scanning', step: 2 }));

    const phases: Array<AnalysisState['analysisPhase']> = ['scanning', 'parsing', 'tracking', 'reporting', 'done'];
    phases.forEach((phase, i) => {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          analysisPhase: phase,
          ...(phase === 'done' ? {
            isAnalyzing: false,
            impacts: scenarioImpacts[scenarioId] || [],
          } : {}),
        }));
      }, (i + 1) * 800);
    });
  }, [scenarioId]);

  const proceed = useCallback(() => {
    setState(prev => ({ ...prev, step: 4 }));
  }, []);

  const cancel = useCallback(() => {
    setState(prev => ({
      ...initialState,
      prompt: prev.prompt,
      targetFunction: prev.targetFunction,
      targetFile: prev.targetFile,
    }));
  }, []);

  const toggleExcludedFile = useCallback((file: string) => {
    setState(prev => ({
      ...prev,
      excludedFiles: prev.excludedFiles.includes(file)
        ? prev.excludedFiles.filter(f => f !== file)
        : [...prev.excludedFiles, file],
    }));
  }, []);

  const setShowDiff = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showDiff: show }));
  }, []);

  const setPrompt = useCallback((prompt: string) => {
    setState(prev => ({ ...prev, prompt }));
  }, []);

  const goToStep3 = useCallback(() => {
    setState(prev => ({ ...prev, step: 3 }));
  }, []);

  const goToStep = useCallback((step: 1 | 2 | 3 | 4) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const changeTarget = useCallback((file: string, fn: string) => {
    const newImpacts = computeImpacts(file, fn);
    setState(prev => ({
      ...prev,
      targetFile: file,
      targetFunction: fn,
      impacts: newImpacts,
    }));
  }, []);

  return {
    state,
    scenarioId,
    selectScenario,
    startAnalysis,
    proceed,
    cancel,
    toggleExcludedFile,
    setShowDiff,
    setPrompt,
    goToStep3,
    goToStep,
    changeTarget,
  };
}
