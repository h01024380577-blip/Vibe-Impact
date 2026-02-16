# Vibe Impact — 바이브 코딩 변경 영향 사전 분석 시스템

> AI 코드 수정 전, 변경이 프로젝트 전체에 미칠 영향을 사전에 분석합니다.  
> 연쇄 결함을 예방하고, AI에게 더 정확한 맥락을 제공합니다.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue) ![React Flow](https://img.shields.io/badge/React_Flow-12-purple)

---

## 📌 프로젝트 개요

**Vibe Impact**는 바이브 코딩(AI 코드 생성) 환경에서 발생하는 **"하나를 고치면 다른 곳이 망가지는" 연쇄 결함 문제**를 해결하기 위한 MVP 데모입니다.

사용자가 코드 수정을 요청하면, 해당 수정이 프로젝트 전체에 미칠 영향을 자동으로 분석하고, 분석 결과를 반영한 **맥락 인지 프롬프트**를 생성하여 AI 코드 수정의 안전성을 높입니다.

---

## 🔄 4단계 워크플로우

### Step 1 — 수정 요청 입력
- 미리 로드된 샘플 프로젝트(쇼핑몰 백엔드 6개 파일)를 코드 에디터에서 탐색
- 3가지 시나리오 중 선택하거나 자연어로 수정 요청 입력
- 수정 대상 파일 및 함수 자동 식별

### Step 2 — 의존성 분석 + 영향 리포트
- 파일 스캐닝 → AST 파싱 → 의존성 추적 → 리포트 생성 단계별 애니메이션
- **텍스트 리포트**: 🔴 직접 영향 / 🟡 간접 영향 / 🟢 영향 없음으로 분류
- **인터랙티브 의존성 그래프**: React Flow 기반 노드-엣지 시각화 (색상 코딩 + 툴팁)

### Step 3 — 사용자 의사결정
- ✅ 진행: 영향 분석 결과를 AI 프롬프트에 자동 포함
- 🔧 범위 조정: 특정 파일을 제외하여 수정 범위 제한
- ❌ 취소: Step 1로 복귀

### Step 4 — 프롬프트 강화 + 결과 비교
- **Before**: 맥락 없는 기존 프롬프트 + 예상 문제점
- **After**: 의존성 분석이 자동 추가된 강화 프롬프트
- **코드 Diff 비교**: 기존 방식(문제 코드) vs Vibe Impact 방식(안전 코드) 나란히 비교

---

## 🎯 시나리오

| # | 시나리오 | 대상 파일 | 영향 범위 |
|---|---------|----------|----------|
| 1 | `handlePaymentError`에 재시도 로직 추가 | `payment.js` | order, refund 직접 / notification, logger 간접 |
| 2 | `logTransaction` 로그 포맷을 CSV로 변경 | `logger.js` | 전체 파일 간접 영향 |
| 3 | `validateUser`에 2단계 인증 추가 | `auth.js` | auth.js만 영향 (안전한 수정) |

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| 그래프 시각화 | @xyflow/react (React Flow) |
| 빌드 도구 | Vite |
| 상태 관리 | React Hooks (useAnalysis 커스텀 훅) |

---

## 📁 주요 파일 구조

```
src/
├── components/
│   ├── CodeEditor.tsx          # 파일 탐색기 + 코드 뷰어 (구문 하이라이팅)
│   ├── RequestInput.tsx        # 수정 요청 입력 폼 + 시나리오 선택
│   ├── AnalysisAnimation.tsx   # 분석 진행 단계별 애니메이션
│   ├── AnalysisReport.tsx      # 영향도별 분류 텍스트 리포트
│   ├── DependencyGraph.tsx     # React Flow 의존성 그래프
│   ├── DecisionPanel.tsx       # 진행/범위조정/취소 의사결정 UI
│   ├── PromptComparison.tsx    # Before/After 프롬프트 비교
│   ├── CodeDiffViewer.tsx      # 생성 코드 diff 비교 뷰어
│   └── StepProgress.tsx        # 상단 4단계 프로그레스 바
├── data/
│   ├── sampleProject.ts        # 샘플 프로젝트 6개 파일 데이터
│   └── analysisResults.ts      # 시나리오별 분석 결과 + 강화 프롬프트 + diff 코드
├── hooks/
│   └── useAnalysis.ts          # 분석 워크플로우 상태 관리 훅
├── types/
│   └── analysis.ts             # TypeScript 타입 정의
└── pages/
    └── Index.tsx               # 메인 페이지 (4단계 흐름 통합)
```

---

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

---

## 📝 참고사항

- 이 MVP는 프론트엔드 전용 데모로, AST 분석은 사전 계산된 결과를 사용합니다.
- AI 코드 생성 비교(Step 4)는 미리 작성된 코드로 시뮬레이션됩니다.
- 다크 테마(VS Code 스타일) 기반 UI로 설계되었습니다.
