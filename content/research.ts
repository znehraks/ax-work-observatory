import {
  BellRing,
  Bot,
  Braces,
  ClipboardCheck,
  DatabaseZap,
  FileText,
  GitPullRequestDraft,
  MessagesSquare,
  Radar,
  ScrollText,
  Waypoints,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ResearchTrack = {
  id: string;
  lane: "Observe" | "Remember" | "Generate" | "Respond";
  title: string;
  shortTitle: string;
  summary: string;
  question: string;
  article: ResearchArticle;
  input: string[];
  process: string[];
  artifact: string[];
  feedback: string[];
  status: "Active research" | "Prototype running" | "Method draft";
  accent: string;
  icon: LucideIcon;
  machine: ResearchMachine;
};

export type ResearchArticle = {
  headline: string[];
  lead: string;
  issueBody: string;
  cards: Array<{
    title: string;
    copy: string;
  }>;
};

export type MachineVariant = "observatory" | "memory" | "content" | "response";

export type MachinePart = {
  id: "intake" | "context" | "engine" | "gate" | "artifact" | "feedback";
  code: string;
  label: string;
  mappedTo: string;
  role: string;
  marker: {
    x: number;
    y: number;
  };
};

export type ResearchMachine = {
  variant: MachineVariant;
  headline: string;
  thesis: string;
  tempo: number;
  intensity: number;
  focus: MachinePart["id"];
  parts: MachinePart[];
};

export const researchTracks: ResearchTrack[] = [
  {
    id: "aidlc-studio",
    lane: "Observe",
    title: "AIDLC Studio",
    shortTitle: "Workflow Observatory",
    summary:
      "터미널 안에 숨어 있던 AI 개발 워크플로를 브라우저에서 관측, 승인, 협업 가능한 화면으로 바꾸는 연구.",
    question: "AI 개발 과정을 어떻게 이해 가능하고 승인 가능한 흐름으로 만들 수 있을까?",
    article: {
      headline: ["프롬프트는", "어떻게", "관측 가능한", "작업장이 되는가"],
      lead:
        "AIDLC Studio는 터미널 속 에이전트 실행을 브라우저에서 읽고 승인할 수 있는 작업장으로 옮기는 실험이다. 프롬프트, 파일, 실행 상태가 하나의 편집 가능한 흐름으로 묶인다.",
      issueBody:
        "이번 dispatch는 AI 개발을 단순 자동 실행이 아니라 관측 가능한 제작 과정으로 다룬다. 입력 맥락을 수집하고, 에이전트의 진행 단계를 드러내며, 사람이 승인해야 할 순간을 별도의 게이트로 분리한다.",
      cards: [
        {
          title: "입력의 표면",
          copy: "Prompt, project files, workflow state를 하나의 작업 신호로 모아 실행 전 맥락을 보이게 한다.",
        },
        {
          title: "승인 가능한 실행",
          copy: "Agent execution과 phase tracking 사이에 사람이 판단할 수 있는 approval gate를 둔다.",
        },
        {
          title: "타임라인 산출물",
          copy: "실행 결과를 live timeline과 stakeholder surface로 남겨 다음 리뷰가 가능한 상태로 만든다.",
        },
      ],
    },
    input: ["Prompt", "Project files", "Workflow state"],
    process: ["Agent execution", "Phase tracking", "Approval gate"],
    artifact: ["Live timeline", "Rendered artifacts", "Stakeholder surface"],
    feedback: ["Comments", "Approvals", "Diff review"],
    status: "Active research",
    accent: "var(--green)",
    icon: Radar,
    machine: {
      variant: "observatory",
      headline: "Workflow Observatory",
      thesis: "개발 입력과 실행 상태를 관측 가능한 승인 흐름으로 바꾸는 장치.",
      tempo: 1,
      intensity: 1,
      focus: "gate",
      parts: [
        {
          id: "intake",
          code: "IN",
          label: "Intake Scanner",
          mappedTo: "Prompt / Files / State",
          role: "프롬프트, 프로젝트 파일, 워크플로 상태를 하나의 관측 신호로 투입",
          marker: { x: 13, y: 48 },
        },
        {
          id: "context",
          code: "CTX",
          label: "Phase Drum",
          mappedTo: "Phase Tracking",
          role: "에이전트 실행을 단계별 진행 맥락으로 정렬",
          marker: { x: 35, y: 42 },
        },
        {
          id: "engine",
          code: "RUN",
          label: "Agent Runner Console",
          mappedTo: "Agent Execution",
          role: "실제 작업 실행과 상태 변화를 구동",
          marker: { x: 53, y: 36 },
        },
        {
          id: "gate",
          code: "OK",
          label: "Approval Gate",
          mappedTo: "Approval Gate",
          role: "사람이 확인해야 할 승인 지점을 시각적으로 분리",
          marker: { x: 70, y: 52 },
        },
        {
          id: "artifact",
          code: "OUT",
          label: "Artifact Press",
          mappedTo: "Live Timeline",
          role: "렌더링 결과, 타임라인, 이해관계자 화면을 산출",
          marker: { x: 84, y: 56 },
        },
        {
          id: "feedback",
          code: "REV",
          label: "Review Return",
          mappedTo: "Diff Review",
          role: "코멘트와 승인 결과를 다음 실행 조건으로 되돌림",
          marker: { x: 26, y: 70 },
        },
      ],
    },
  },
  {
    id: "agent-conversation-logger",
    lane: "Remember",
    title: "Agent Conversation Logger",
    shortTitle: "Work Memory Layer",
    summary:
      "Codex와 Claude Code의 대화, 도구 호출, 실행 흔적을 Obsidian과 분석 가능한 이벤트로 남기는 메모리 레이어.",
    question: "AI와 일한 대화를 어떻게 다음 실행을 개선하는 자산으로 바꿀 수 있을까?",
    article: {
      headline: ["대화는", "어떻게", "다음 실행의", "기억이 되는가"],
      lead:
        "Agent Conversation Logger는 Codex와 Claude Code에서 흘러가는 대화, 도구 호출, 판단 흔적을 잃어버리지 않기 위한 기억 레이어다. 대화는 기록되고, 기록은 다음 실행의 재료가 된다.",
      issueBody:
        "이 dispatch는 에이전트와의 협업을 일회성 채팅이 아니라 축적 가능한 작업 메모리로 바라본다. 세션을 캡처하고, 이벤트를 정규화하고, 안전하게 남길 수 있는 기록만 아카이브한다.",
      cards: [
        {
          title: "세션 캡처",
          copy: "Codex와 Claude Code의 대화, tool event, 실행 경계를 같은 관측 단위로 수집한다.",
        },
        {
          title: "이벤트 문법",
          copy: "Transcript와 lifecycle hook을 JSONL로 분석 가능한 구조로 정규화한다.",
        },
        {
          title: "다음 실행의 기억",
          copy: "Obsidian log, HTML viewer, next-run template로 회고와 재사용 루프를 만든다.",
        },
      ],
    },
    input: ["Codex sessions", "Claude Code sessions", "Tool events"],
    process: ["Lifecycle hooks", "Transcript capture", "Event normalization"],
    artifact: ["Obsidian logs", "JSONL events", "HTML viewer"],
    feedback: ["Insights", "Prompt coaching", "Next-run templates"],
    status: "Prototype running",
    accent: "var(--cyan)",
    icon: MessagesSquare,
    machine: {
      variant: "memory",
      headline: "Work Memory Layer",
      thesis: "대화와 도구 호출을 다음 실행이 참조할 수 있는 기억 레이어로 압축.",
      tempo: 0.82,
      intensity: 0.82,
      focus: "artifact",
      parts: [
        {
          id: "intake",
          code: "CAP",
          label: "Session Capture",
          mappedTo: "Codex / Claude",
          role: "여러 에이전트 세션과 도구 이벤트를 빠짐없이 수집",
          marker: { x: 11, y: 48 },
        },
        {
          id: "context",
          code: "NORM",
          label: "Normalization Reel",
          mappedTo: "Event Normalization",
          role: "대화, 도구 호출, 실행 흔적을 같은 이벤트 문법으로 정규화",
          marker: { x: 35, y: 35 },
        },
        {
          id: "engine",
          code: "IDX",
          label: "Memory Index",
          mappedTo: "Lifecycle Hooks",
          role: "실행 생애주기별로 로그를 묶어 검색 가능한 기억으로 재배열",
          marker: { x: 53, y: 44 },
        },
        {
          id: "gate",
          code: "SAFE",
          label: "Privacy Gate",
          mappedTo: "Transcript Capture",
          role: "남겨야 할 정보와 감춰야 할 정보를 분리",
          marker: { x: 68, y: 54 },
        },
        {
          id: "artifact",
          code: "LOG",
          label: "Archive Stack",
          mappedTo: "Obsidian / JSONL",
          role: "Obsidian 노트, JSONL 이벤트, HTML 뷰어를 산출",
          marker: { x: 83, y: 54 },
        },
        {
          id: "feedback",
          code: "NEXT",
          label: "Prompt Coaching",
          mappedTo: "Next-run Templates",
          role: "인사이트와 프롬프트 코칭을 다음 실행 템플릿으로 환류",
          marker: { x: 23, y: 71 },
        },
      ],
    },
  },
  {
    id: "data-to-content-workflow",
    lane: "Generate",
    title: "Data-to-Content Workflow",
    shortTitle: "Signal to Content",
    summary:
      "데이터 수집, 구조화, 해석, 콘텐츠 초안 생성, 저장과 발송까지 이어지는 반복 가능한 생산 파이프라인.",
    question: "수집된 신호를 어떻게 매일 발행 가능한 지식과 콘텐츠로 전환할 수 있을까?",
    article: {
      headline: ["신호는", "어떻게", "발행 가능한", "초안이 되는가"],
      lead:
        "Data-to-Content Workflow는 흩어진 리서치 신호를 수집하고 구조화해 실제로 발행 가능한 브리프와 초안으로 바꾸는 생산 파이프라인이다.",
      issueBody:
        "이 dispatch는 데이터 수집 그 자체보다, 수집된 신호가 어떻게 문장과 판단으로 변환되는지를 추적한다. 저장된 노트와 맥락 아카이브는 구조화 단계를 거쳐 검증 가능한 콘텐츠 초안으로 이어진다.",
      cards: [
        {
          title: "신호 수집",
          copy: "Research signals, saved notes, context archive를 발행 후보가 되는 재료로 모은다.",
        },
        {
          title: "의미 구조화",
          copy: "Collect와 Structure 단계에서 자료를 논점, 근거, 재사용 가능한 맥락으로 나눈다.",
        },
        {
          title: "발행 대기열",
          copy: "Research brief, article draft, Obsidian note를 검증 질문과 publishing queue로 연결한다.",
        },
      ],
    },
    input: ["Research signals", "Saved notes", "Context archive"],
    process: ["Collect", "Structure", "Generate"],
    artifact: ["Research brief", "Article draft", "Obsidian note"],
    feedback: ["Validation questions", "Reuse score", "Publishing queue"],
    status: "Active research",
    accent: "var(--amber)",
    icon: DatabaseZap,
    machine: {
      variant: "content",
      headline: "Signal to Content",
      thesis: "분산된 신호를 검증 가능한 브리프와 발행 가능한 초안으로 합성.",
      tempo: 1.12,
      intensity: 1.08,
      focus: "engine",
      parts: [
        {
          id: "intake",
          code: "SIG",
          label: "Signal Collector",
          mappedTo: "Research Signals",
          role: "리서치 신호, 저장 노트, 맥락 아카이브를 수집",
          marker: { x: 14, y: 36 },
        },
        {
          id: "context",
          code: "SORT",
          label: "Structure Sieve",
          mappedTo: "Collect / Structure",
          role: "원천 데이터를 기사화 가능한 구조로 걸러냄",
          marker: { x: 34, y: 48 },
        },
        {
          id: "engine",
          code: "GEN",
          label: "Synthesis Desk",
          mappedTo: "Generate",
          role: "맥락을 해석하고 브리프와 초안의 핵심 논지를 생성",
          marker: { x: 54, y: 39 },
        },
        {
          id: "gate",
          code: "QA",
          label: "Validation Prism",
          mappedTo: "Validation Questions",
          role: "질문, 재사용 점수, 발행 대기열로 검증 루프를 만듦",
          marker: { x: 69, y: 52 },
        },
        {
          id: "artifact",
          code: "PUB",
          label: "Content Press",
          mappedTo: "Brief / Draft / Note",
          role: "리서치 브리프, 기사 초안, Obsidian 노트를 산출",
          marker: { x: 84, y: 61 },
        },
        {
          id: "feedback",
          code: "QUEUE",
          label: "Publishing Queue",
          mappedTo: "Reuse Score",
          role: "검증 결과와 재사용 점수를 다음 콘텐츠 생산에 반영",
          marker: { x: 29, y: 73 },
        },
      ],
    },
  },
  {
    id: "agentic-task-automation",
    lane: "Respond",
    title: "24/7 Agentic Task Automation",
    shortTitle: "On-call Response Loop",
    summary:
      "Slack/Jira 신호를 분류하고 계획, 승인, 구현, 검증, Draft PR까지 이어주는 온콜 대응 자동화 연구.",
    question: "운영 요청을 어디까지 안전하게 자동 분류하고 실행 대기 상태로 만들 수 있을까?",
    article: {
      headline: ["알림은", "어떻게", "승인 가능한", "PR이 되는가"],
      lead:
        "24/7 Agentic Task Automation은 Slack과 Jira에서 들어오는 운영 신호를 분류하고, 승인 가능한 작업 단위로 바꾼 뒤 Draft PR까지 밀어 올리는 대응 루프다.",
      issueBody:
        "이 dispatch는 온콜 자동화를 즉시 실행되는 봇이 아니라, 위험도와 승인 조건을 분리하는 대응 시스템으로 다룬다. 신호는 triage되고, 작업은 계획되며, 실행은 감사 가능한 산출물로 남는다.",
      cards: [
        {
          title: "신호 분류",
          copy: "Slack signal, Jira issue, runtime health를 읽어 위험도와 작업 가능 범위를 먼저 나눈다.",
        },
        {
          title: "승인 잠금",
          copy: "Plan과 approval gate를 거쳐 자동 실행 전에 사람이 판단해야 할 지점을 명확히 둔다.",
        },
        {
          title: "Draft PR 루프",
          copy: "Worker run 결과를 Draft PR, audit report, status reaction으로 남겨 리뷰 가능한 상태를 만든다.",
        },
      ],
    },
    input: ["Slack signal", "Jira issue", "Runtime health"],
    process: ["Intake classify", "Plan", "Approval gate", "Worker run"],
    artifact: ["Draft PR", "Audit report", "Status reaction"],
    feedback: ["CI gates", "Completion audit", "Human review"],
    status: "Method draft",
    accent: "var(--red)",
    icon: BellRing,
    machine: {
      variant: "response",
      headline: "On-call Response Loop",
      thesis: "운영 신호를 분류, 승인, 실행, 검증 가능한 대응 대기로 전환.",
      tempo: 1.28,
      intensity: 1.22,
      focus: "gate",
      parts: [
        {
          id: "intake",
          code: "ALERT",
          label: "Incident Beacon",
          mappedTo: "Slack / Jira",
          role: "Slack 신호와 Jira 이슈, 런타임 상태를 긴급 입력으로 받음",
          marker: { x: 13, y: 32 },
        },
        {
          id: "context",
          code: "TRIAGE",
          label: "Triage Classifier",
          mappedTo: "Intake Classify",
          role: "운영 요청을 위험도와 실행 가능성 기준으로 분류",
          marker: { x: 33, y: 47 },
        },
        {
          id: "engine",
          code: "WORK",
          label: "Worker Relay",
          mappedTo: "Worker Run",
          role: "계획된 대응 작업을 실행 대기 가능한 작업 단위로 전달",
          marker: { x: 53, y: 43 },
        },
        {
          id: "gate",
          code: "LOCK",
          label: "Approval Lock",
          mappedTo: "Approval Gate",
          role: "자동 실행 전 사람이 승인해야 하는 지점을 잠금",
          marker: { x: 69, y: 51 },
        },
        {
          id: "artifact",
          code: "PR",
          label: "Draft PR Press",
          mappedTo: "Draft PR / Audit",
          role: "Draft PR, 감사 리포트, 상태 반응을 생성",
          marker: { x: 84, y: 57 },
        },
        {
          id: "feedback",
          code: "CI",
          label: "Completion Audit",
          mappedTo: "CI / Human Review",
          role: "CI 게이트와 사람 리뷰 결과를 완료 감사로 되돌림",
          marker: { x: 25, y: 72 },
        },
      ],
    },
  },
];

export const flowNodes = [
  { label: "Prompt", icon: Bot },
  { label: "Conversation", icon: ScrollText },
  { label: "Data", icon: Braces },
  { label: "Ops Signal", icon: ClipboardCheck },
  { label: "Artifacts", icon: FileText },
  { label: "Draft PR", icon: GitPullRequestDraft },
  { label: "Next Run", icon: Waypoints },
];
