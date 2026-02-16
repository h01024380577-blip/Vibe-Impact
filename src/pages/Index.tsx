import { useState } from 'react';
import StepProgress from '@/components/StepProgress';
import CodeEditor from '@/components/CodeEditor';
import RequestInput from '@/components/RequestInput';
import AnalysisAnimation from '@/components/AnalysisAnimation';
import AnalysisReport from '@/components/AnalysisReport';
import DependencyGraph from '@/components/DependencyGraph';
import DecisionPanel from '@/components/DecisionPanel';
import PromptComparison from '@/components/PromptComparison';
import CodeDiffViewer from '@/components/CodeDiffViewer';
import { useAnalysis } from '@/hooks/useAnalysis';
import { sampleFiles } from '@/data/sampleProject';
import { Zap, Shield, GitBranch, ArrowLeft } from 'lucide-react';

const Index = () => {
  const {
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
  } = useAnalysis();

  const [activeFile, setActiveFile] = useState('payment.js');

  const handleScenarioChange = (id: string) => {
    selectScenario(id);
    const scenario = sampleFiles.find(f => f.name === 
      (id === 'retry' ? 'payment.js' : id === 'log-format' ? 'logger.js' : 'auth.js')
    );
    if (scenario) setActiveFile(scenario.name);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-gradient-primary">Vibe Impact</span>
          </div>
          <StepProgress currentStep={state.step} />
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4">
        {/* Step 1 */}
        {state.step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Hero */}
            <div className="text-center py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                바이브 코딩 변경 영향 <span className="text-gradient-primary">사전 분석</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Vibe Impact는 AI 코드 수정 전, 변경이 프로젝트 전체에 미칠 영향을 사전에 분석합니다.
                연쇄 결함을 예방하고, AI에게 더 정확한 맥락을 제공합니다.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4">
                <Feature icon={<Shield className="w-4 h-4" />} text="연쇄 결함 예방" />
                <Feature icon={<GitBranch className="w-4 h-4" />} text="의존성 자동 추적" />
                <Feature icon={<Zap className="w-4 h-4" />} text="맥락 인지 프롬프트" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Code editor - 2 cols */}
              <div className="lg:col-span-2 h-[480px]">
                <CodeEditor
                  files={sampleFiles}
                  activeFile={activeFile}
                  onFileSelect={setActiveFile}
                  highlightFunction={state.targetFunction}
                />
              </div>

              {/* Request input */}
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <RequestInput
                    prompt={state.prompt}
                    onPromptChange={setPrompt}
                    onAnalyze={startAnalysis}
                    scenarioId={scenarioId}
                    onScenarioChange={handleScenarioChange}
                  />
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">수정 대상</h3>
                  <div className="flex items-center gap-2 bg-code-bg rounded-lg px-3 py-2 border border-border">
                    <span className="text-xs text-primary font-mono">{state.targetFile}</span>
                    <span className="text-xs text-muted-foreground">{'>'}</span>
                    <span className="text-xs text-syntax-function font-mono">{state.targetFunction}()</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Analysis */}
        {state.step === 2 && (
          <div className="space-y-6">
            {state.analysisPhase !== 'done' ? (
              <AnalysisAnimation phase={state.analysisPhase} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-4">
                  <AnalysisReport
                    targetFile={state.targetFile}
                    targetFunction={state.targetFunction}
                    impacts={state.impacts}
                  />
                  <button
                    onClick={goToStep3}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all glow-primary"
                  >
                    다음 단계로 →
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    의존성 그래프
                  </h3>
                  <DependencyGraph
                    targetFile={state.targetFile}
                    impacts={state.impacts}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 - Decision */}
        {state.step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 py-8 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">분석이 완료되었습니다</h2>
              <p className="text-sm text-muted-foreground">어떻게 진행하시겠습니까?</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 mb-6">
              <AnalysisReport
                targetFile={state.targetFile}
                targetFunction={state.targetFunction}
                impacts={state.impacts}
              />
            </div>

            <DecisionPanel
              impacts={state.impacts}
              excludedFiles={state.excludedFiles}
              onToggleExclude={toggleExcludedFile}
              onProceed={proceed}
              onCancel={cancel}
            />
          </div>
        )}

        {/* Step 4 - Comparison */}
        {state.step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                onClick={cancel}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                처음으로
              </button>
              <h2 className="text-lg font-bold text-foreground">프롬프트 강화 결과 비교</h2>
              <div />
            </div>

            <PromptComparison
              originalPrompt={state.prompt}
              scenarioId={scenarioId}
              onShowDiff={() => setShowDiff(true)}
            />

            {state.showDiff && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  생성된 코드 비교
                </h3>
                <CodeDiffViewer scenarioId={scenarioId} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 text-center">
        <p className="text-xs text-muted-foreground">
          Vibe Impact — AI 코드 수정의 연쇄 결함을 예방합니다
        </p>
      </footer>
    </div>
  );
};

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="text-primary">{icon}</span>
      {text}
    </div>
  );
}

export default Index;
