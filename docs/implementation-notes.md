# 구현 노트

## 선택한 접근

가장 적합한 방식은 `Imagegen 시안 + SVG/Framer Motion 애니메이션 + HTML 라벨` 하이브리드로 결정했다. 다만 특정 dispatch가 더 구체적인 타임라인 영상을 필요로 할 때는 Remotion으로 짧은 MP4를 렌더링해 중앙 슬롯에 삽입한다.

이유:

- 신문 삽화 같은 아날로그 감성을 유지할 수 있다.
- 영상이나 3D보다 흐름도 가독성이 좋다.
- 텍스트는 HTML로 관리하므로 정확하고 교체하기 쉽다.
- 연구 주제는 `content/research.ts` 데이터만 바꿔도 같은 문법으로 다시 렌더링된다.
- `Frame Notes` 상세 화면으로 깊은 매핑 설명을 분리할 수 있다.

## 이번 구현 변경

- 중앙 dispatch 이미지 영역을 추상 카드/선 장식에서 실제 연구 데이터 기반 workflow board로 교체했다.
- `DispatchFlowIllustration`, `FlowColumn`을 추가했다.
- 각 연구의 `input`, `process`, `artifact`, `feedback` 배열을 그대로 노출해 내용 관련성을 높였다.
- `Signals -> Work Steps -> Artifacts` 3컬럼을 기본 구조로 삼고, `Gate`와 `Return Loop`를 별도 리본으로 분리했다.
- Framer Motion으로 카드 강조, 진행선 fill, 이동 토큰, 게이트 강조, 피드백 리듬을 구현했다.
- 프로젝트별 깊은 장치 매핑은 기존 `Frame Notes` 상세 오버레이에 유지했다.
- 중앙 슬롯 배경을 어두운 추상 사진에서 warm paper / ink diagram 톤으로 변경했다.
- 네 가지 dispatch 모두에 Remotion으로 렌더링한 7초짜리 pipeline film을 삽입했다.
- `AIDLC Studio`는 prompt, project files, agent run, approval, live timeline 흐름을 보여준다.
- `Agent Conversation Logger`는 Codex/Claude 세션, hook capture, normalize, archive 흐름을 보여준다.
- `Data-to-Content Workflow`는 signal, collect, structure, generate, publish 흐름을 보여준다.
- `24/7 Agentic Task Automation`은 Slack signal, Jira triage, Codex/OpenAI worker, GitHub Draft PR, CI/Human review return loop 흐름을 보여준다.
- 공통 영상 소스는 `remotion/ResearchPipelineFilms.tsx`, task automation 전용 소스는 `remotion/AgenticTaskAutomationPipeline.tsx`다.
- 출력 파일은 `public/media/aidlc-studio.mp4`, `public/media/agent-conversation-logger.mp4`, `public/media/data-to-content-workflow.mp4`, `public/media/agentic-task-automation.mp4`다.

## 유지보수 원칙

- 새로운 연구 항목은 먼저 `content/research.ts`에 추가한다.
- SVG 도식이 깨지면 `machine.parts[].marker` 좌표를 조정한다.
- 메인 화면의 라벨은 짧게 유지하고, 긴 설명은 상세 오버레이에서 처리한다.
- 장식용 모션보다 workflow 이해를 돕는 모션만 추가한다.
- Remotion 영상 자산은 `npm run remotion:render`로 재생성한다.
- 3D는 현재 기본 설명 흐름에서 제외하고, 첫 화면과 상세 화면 모두 HTML/Framer Motion 기반의 읽히는 도식으로 유지한다.
