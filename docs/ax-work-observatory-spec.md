# AX Work Observatory 작업 히스토리 및 구현 스펙

작성일: 2026-06-29

## 1. 컨셉 히스토리

이 프로젝트는 개인 포트폴리오를 전면에 내세우는 페이지가 아니라, 진행 중인 AX 연구를 먼저 보여주는 독립 연구 매체 형태로 방향을 잡았다. 사용자가 직접적인 자기소개보다 "이 사람 누구지?"라고 느낀 뒤 프로필을 확인할 수 있는 흐름을 원했기 때문에, 메인 화면은 개인 브랜딩보다 연구 관측과 기록의 분위기를 우선한다.

초기에는 정적 포트폴리오, 3D 게이미피케이션, 연구 로그형 블로그 등 여러 방향을 검토했다. 이후 "AI에 지친 사람들을 위한 아날로그 신문 감성, 내용은 최신 AI/AX 연구"라는 역설적인 콘셉트가 가장 적합하다고 판단했다. 그래서 첫 화면은 `AX Work Observatory`라는 신문 1면처럼 구성하고, 연구 항목은 `Research Dispatch` 컬럼에 배치했다.

중앙의 움직이는 영역은 처음에는 3D/골드버그 장치형 애니메이션을 시도할 수 있는 후보로 논의했다. 그러나 사용자는 "화려하지만 가독성이 좋아야 한다", "각 요소가 무엇을 뜻하는지 알아야 한다", "의미 없는 기계 부품 나열은 피하고 싶다"고 피드백했다. 그 결과 3D 장식보다, 연구 워크플로우 자체를 읽을 수 있는 도식형 애니메이션이 더 적합하다고 정리했다.

최종 선택한 방식은 `Imagegen 시안 + SVG/Framer Motion 애니메이션 + HTML 라벨` 하이브리드다. Imagegen은 종이/잉크/도식 삽화의 톤과 구도 기준을 만드는 용도로 사용하고, 실제 웹에서는 데이터 기반 SVG 도식과 HTML 라벨로 재구성한다. 이 방식은 연구 주제가 바뀌어도 `content/research.ts`의 데이터만 바꾸면 같은 애니메이션 문법을 재사용할 수 있다.

## 2. 현재 메인 연구 주제

현재 `Research Dispatch`는 네 가지 AX 연구를 전면에 둔다.

1. `AIDLC Studio`
   - 터미널 안에 숨어 있던 AI 개발 워크플로를 브라우저에서 관측, 승인, 협업 가능한 화면으로 바꾸는 연구.
   - 핵심 흐름: Prompt / Project files / Workflow state -> Agent execution -> Phase tracking -> Approval gate -> Live timeline / Review.

2. `Agent Conversation Logger`
   - Codex와 Claude Code의 대화, 도구 호출, 실행 흔적을 Obsidian과 분석 가능한 이벤트로 남기는 메모리 레이어.
   - 핵심 흐름: Sessions / Tool events -> Lifecycle hooks -> Transcript capture -> Event normalization -> Privacy gate -> Obsidian / JSONL / HTML viewer.

3. `Data-to-Content Workflow`
   - 데이터 수집, 구조화, 해석, 콘텐츠 초안 생성, 저장과 발송까지 이어지는 반복 가능한 생산 파이프라인.
   - 핵심 흐름: Research signals / Saved notes / Context archive -> Collect -> Structure -> Generate -> Validate -> Publish queue.

4. `24/7 Agentic Task Automation`
   - Slack/Jira 신호를 분류하고 계획, 승인, 구현, 검증, Draft PR까지 이어주는 온콜 대응 자동화 연구.
   - 핵심 흐름: Slack / Jira / Runtime health -> Triage -> Plan -> Approval gate -> Worker run -> Draft PR / Audit / Status reaction.

## 3. 구현 구조

프레임워크는 Next.js App Router 기반이며, 주요 파일은 아래와 같다.

- `app/page.tsx`: 홈 화면 진입점.
- `components/observatory-home.tsx`: 신문 UI, dispatch 선택 상태, 중앙 도식 애니메이션, 상세 모달을 구성.
- `components/research-machine-scene.tsx`: 이전 Three.js 기반 매핑 실험. 현재 `Frame Notes` 상세 화면은 2D 편집 노트 방식으로 렌더링한다.
- `content/research.ts`: 모든 연구 주제와 애니메이션 문법의 원천 데이터.
- `app/globals.css`: 신문 레이아웃, 종이 질감, dispatch 도식, 반응형 스타일.
- `remotion/AgenticTaskAutomationPipeline.tsx`: `24/7 Agentic Task Automation`용 pipeline film 소스.
- `public/media/agentic-task-automation.mp4`: Remotion으로 렌더링한 7초 MP4 자산.

중앙 애니메이션은 `ResearchPhoto` 내부의 `DispatchFlowIllustration` 컴포넌트가 담당한다. 기본적으로 이 컴포넌트는 `activeTrack.input`, `activeTrack.process`, `activeTrack.artifact`, `activeTrack.feedback`를 직접 읽어서 카드형 workflow board를 만든다. `24/7 Agentic Task Automation`은 예외적으로 Remotion으로 렌더링한 pipeline film을 같은 슬롯에 재생한다. 메인 화면은 실제 연구 흐름을 먼저 읽히게 하고, `Frame Notes` 상세 화면에서 `machine.parts` 기반의 깊은 매핑을 확인하는 구조다.

## 4. 애니메이션 문법

상세 매핑에서는 각 연구가 공통적으로 여섯 개의 파트를 가진다.

```ts
intake -> context -> engine -> gate -> artifact -> feedback
```

각 파트는 `content/research.ts`에서 아래 정보를 가진다.

- `id`: 공통 단계 식별자.
- `code`: 도식 안에서 보이는 짧은 코드.
- `label`: 상세 화면에서 보이는 장치명.
- `mappedTo`: 실제 프로젝트의 어느 흐름에 대응되는지.
- `role`: 해당 파트의 역할 설명.
- `marker`: 중앙 SVG 도식에서의 좌표.

메인 화면에서는 공통 파트명보다 실제 연구 데이터가 먼저 보인다.

- `Signals`: `activeTrack.input`
- `Work Steps`: `activeTrack.process`
- `Artifacts`: `activeTrack.artifact`
- `Return Loop`: `activeTrack.feedback`
- `Gate`: `machine.parts` 중 `gate`의 `mappedTo`

`24/7 Agentic Task Automation` 영상은 아래 단계가 시간 순서대로 등장한다.

- `Slack`: 운영 신호와 런타임 상태 입력.
- `Jira`: 이슈 분류와 범위 판단.
- `Codex/OpenAI`: 계획, 승인 대기, worker 실행.
- `GitHub`: Draft PR, 감사 노트, 상태 업데이트.
- `Return Loop`: CI gates, completion audit, human review.

정확한 프로젝트별 매핑과 각 장치의 역할은 `Frame Notes`를 누르면 상세 오버레이에서 확인할 수 있다. 이렇게 분리한 이유는 신문 1면의 가독성을 유지하면서도, 사용자가 원할 때 각 요소의 의미를 깊게 확인할 수 있게 하기 위해서다.

## 5. 시각 스타일

중앙 dispatch 이미지는 사실적 사진이나 3D 장면이 아니라, 따뜻한 종이 위의 검은 잉크 업무 보드처럼 보이도록 구성했다.

- 배경: warm off-white paper, subtle grid, halftone/noise.
- 보드: Signals / Work Steps / Artifacts 3개 컬럼.
- 움직임: 진행선이 차오르고, 토큰이 컬럼 사이를 이동하고, 게이트와 피드백 항목이 리듬감 있게 강조된다.
- 라벨: 실제 프로젝트 입력/처리/산출물 텍스트를 HTML로 표시.
- 상세: `Frame Notes`에서 큰 질문, 네 단계 workflow board, 여섯 개 파트의 역할 매핑을 2D 편집 노트로 제공.

## 6. 연구 주제 교체 방법

새로운 연구 주제를 추가하거나 교체할 때는 `content/research.ts`의 `researchTracks`만 수정하는 것을 원칙으로 한다.

필수 입력:

1. `id`, `lane`, `title`, `shortTitle`, `summary`, `question`
2. `input`, `process`, `artifact`, `feedback`
3. `status`, `accent`, `icon`
4. `machine.variant`, `machine.headline`, `machine.thesis`, `tempo`, `intensity`, `focus`
5. 여섯 개의 `machine.parts`

메인 카드형 도식은 `input`, `process`, `artifact`, `feedback` 배열을 바로 사용한다. 상세 `Frame Notes` 화면은 같은 배열과 `machine.parts`를 함께 사용해 큰 workflow board와 역할 매핑표를 만든다. 별도 애니메이션 코드를 매번 작성하지 않아도 된다.

특정 연구가 별도 Remotion 영상이 필요할 때는 `remotion/` 아래에 Composition을 추가하고 `public/media/`에 MP4로 렌더링한다. 웹 페이지에서는 `<video>`로 삽입하되, 라벨이 잘리지 않도록 `object-fit: contain`을 기본으로 둔다.

## 7. 검증

현재 검증한 항목:

- `npm run lint`
- `npm run build`
- `npm run remotion:render`
- 내장 브라우저에서 `http://localhost:3000/` 로드
- 중앙 dispatch 도식 표시 확인
- `24/7 Agentic Task Automation` 선택 시 `/media/agentic-task-automation.mp4`가 로드되고 1280x900, 약 7초 영상으로 재생되는지 확인
- 네 가지 `Research Dispatch` 클릭 시 활성 연구가 바뀌는지 확인
- 브라우저 warning/error 0개 확인

모바일 레이아웃은 CSS media query로 대응되어 있으며, 현재 내장 브라우저 래퍼가 viewport 변경 API를 제공하지 않아 별도 모바일 스크린샷 자동 검증은 수행하지 않았다.
