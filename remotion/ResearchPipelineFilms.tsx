import { faAws, faOpenai } from "@fortawesome/free-brands-svg-icons";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Bot,
  DatabaseZap,
  FileJson,
  FolderGit2,
  GitBranch,
  MessageSquareText,
  MessagesSquare,
  Network,
  Newspaper,
  PenLine,
  Radar,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const ink = "#111111";
const paper = "#efe8d8";
const muted = "#615b50";

type Point = {
  x: number;
  y: number;
};

type Segment = {
  start: Point;
  controlA: Point;
  controlB: Point;
  end: Point;
};

type BrandIcon = typeof faAws;

type StepIcon =
  | {
      kind: "brand";
      icon: BrandIcon;
    }
  | {
      kind: "lucide";
      icon: LucideIcon;
    };

type FilmStep = {
  label: string;
  caption: string;
  detail: string;
  icon: StepIcon;
  color?: string;
  x: number;
  y: number;
  from: number;
};

type FilmBadge = {
  label: string;
  caption: string;
  detail: string;
  icon: BrandIcon;
  color: string;
  x: number;
  y: number;
  from: number;
};

type FilmConfig = {
  eyebrow: string;
  title: string;
  issue: string;
  description: string;
  accent: string;
  accentSoft: string;
  footer: string;
  steps: FilmStep[];
  segments: Segment[];
  masks: Array<[number, number]>;
  feedback: Array<{ label: string; x: number; y: number; from: number }>;
  badges?: FilmBadge[];
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const cubicPoint = (segment: Segment, t: number): Point => {
  const inverse = 1 - t;
  const a = inverse ** 3;
  const b = 3 * inverse ** 2 * t;
  const c = 3 * inverse * t ** 2;
  const d = t ** 3;

  return {
    x: a * segment.start.x + b * segment.controlA.x + c * segment.controlB.x + d * segment.end.x,
    y: a * segment.start.y + b * segment.controlA.y + c * segment.controlB.y + d * segment.end.y,
  };
};

const buildTrack = (segments: Segment[]) => {
  const samples: Array<Point & { length: number }> = [];
  let totalLength = 0;
  let previous: Point | null = null;

  for (const segment of segments) {
    for (let index = 0; index <= 150; index += 1) {
      if (samples.length > 0 && index === 0) {
        continue;
      }

      const point = cubicPoint(segment, index / 150);

      if (previous) {
        totalLength += Math.hypot(point.x - previous.x, point.y - previous.y);
      }

      samples.push({ ...point, length: totalLength });
      previous = point;
    }
  }

  return { samples, totalLength };
};

const getPointOnTrack = (track: ReturnType<typeof buildTrack>, progress: number): Point => {
  const targetLength = Math.max(0, Math.min(1, progress)) * track.totalLength;
  const nextIndex = track.samples.findIndex((sample) => sample.length >= targetLength);

  if (nextIndex <= 0) {
    return track.samples[0];
  }

  const previous = track.samples[nextIndex - 1];
  const next = track.samples[nextIndex] ?? track.samples[track.samples.length - 1];
  const span = Math.max(next.length - previous.length, 0.0001);
  const mix = (targetLength - previous.length) / span;

  return {
    x: previous.x + (next.x - previous.x) * mix,
    y: previous.y + (next.y - previous.y) * mix,
  };
};

const getTrackPoints = (track: ReturnType<typeof buildTrack>, progress: number) => {
  const targetLength = Math.max(0, Math.min(1, progress)) * track.totalLength;
  const visibleSamples = track.samples.filter((sample) => sample.length <= targetLength);
  const point = getPointOnTrack(track, progress);

  return [...visibleSamples, point].map((sample) => `${sample.x.toFixed(2)},${sample.y.toFixed(2)}`).join(" ");
};

const visibleOutsideRange = (progress: number, start: number, end: number, fade = 0.035) => {
  if (progress < start - fade || progress > end + fade) {
    return 1;
  }

  if (progress < start) {
    return Math.max(0, Math.min(1, (start - progress) / fade));
  }

  if (progress > end) {
    return Math.max(0, Math.min(1, (progress - end) / fade));
  }

  return 0;
};

const useReveal = (from: number, duration = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return spring({
    frame: frame - from,
    fps,
    durationInFrames: duration,
    config: { damping: 18, stiffness: 180 },
  });
};

const BrandIconMark = ({ icon, color, size = 58 }: { icon: BrandIcon; color: string; size?: number }) => {
  const [width, height, , , pathData] = icon.icon;
  const paths = Array.isArray(pathData) ? pathData : [pathData];

  return (
    <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} style={{ width: size, height: size, display: "block" }}>
      {paths.map((path, index) => (
        <path key={`${icon.iconName}-${index}`} d={path} fill={color} />
      ))}
    </svg>
  );
};

const StepIconMark = ({ icon, color }: { icon: StepIcon; color: string }) => {
  if (icon.kind === "brand") {
    return <BrandIconMark icon={icon.icon} color={color} size={68} />;
  }

  const Icon = icon.icon;
  return <Icon aria-hidden="true" size={64} color={color} strokeWidth={2.4} />;
};

const StepNode = ({ step, index, accent }: { step: FilmStep; index: number; accent: string }) => {
  const frame = useCurrentFrame();
  const reveal = useReveal(step.from);
  const pulse = interpolate(frame, [step.from, step.from + 16, step.from + 34], [0, 1, 0.18], clamp);
  const lift = interpolate(reveal, [0, 1], [22, 0]);
  const serial = String(index + 1).padStart(2, "0");
  const iconColor = step.color ?? accent;

  return (
    <div
      style={{
        position: "absolute",
        left: step.x,
        top: step.y,
        zIndex: 3,
        width: 238,
        transform: `translate(-50%, -50%) translateY(${lift}px)`,
        opacity: reveal,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -18,
          border: `2px solid ${accent}`,
          opacity: pulse * 0.26,
          transform: `scale(${1 + pulse * 0.24})`,
        }}
      />
      <div
        style={{
          border: `2px solid ${ink}`,
          background: "rgba(247, 241, 226, 0.98)",
          boxShadow: "0 16px 0 rgba(17, 17, 17, 0.08)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "82px 1fr", minHeight: 132 }}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              borderRight: `2px solid ${ink}`,
              background: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <StepIconMark icon={step.icon} color={iconColor} />
          </div>
          <div style={{ padding: "12px 12px 10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <span
                style={{
                  color: accent,
                  fontSize: 24,
                  fontWeight: 950,
                  fontFamily: "Arial Black, Helvetica, sans-serif",
                  lineHeight: 1,
                }}
              >
                {serial}
              </span>
              <span
                style={{
                  color: muted,
                  fontSize: 13,
                  fontWeight: 850,
                  textAlign: "right",
                  textTransform: "uppercase",
                  lineHeight: 1.05,
                }}
              >
                {step.caption}
              </span>
            </div>
            <strong
              style={{
                display: "block",
                marginTop: 10,
                color: ink,
                fontSize: 34,
                fontWeight: 950,
                lineHeight: 0.95,
                fontFamily: "Georgia, Times New Roman, serif",
              }}
            >
              {step.label}
            </strong>
            <p style={{ margin: "10px 0 0", color: "#27231e", fontSize: 15, fontWeight: 780, lineHeight: 1.14 }}>
              {step.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SideBadge = ({ badge }: { badge: FilmBadge }) => {
  const reveal = useReveal(badge.from, 20);

  return (
    <div
      style={{
        position: "absolute",
        left: badge.x,
        top: badge.y,
        zIndex: 2,
        width: 212,
        transform: `translate(-50%, -50%) translateY(${interpolate(reveal, [0, 1], [18, 0])}px)`,
        opacity: reveal,
        border: `2px solid ${ink}`,
        background: "rgba(247, 241, 226, 0.96)",
        boxShadow: "8px 8px 0 rgba(17, 17, 17, 0.1)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "82px 1fr", minHeight: 104 }}>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            borderRight: `2px solid ${ink}`,
            background: "rgba(255, 255, 255, 0.24)",
          }}
        >
          <BrandIconMark icon={badge.icon} color={badge.color} size={60} />
        </div>
        <div style={{ padding: "10px 10px 8px" }}>
          <span
            style={{
              display: "block",
              color: badge.color,
              fontSize: 12,
              fontWeight: 950,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {badge.caption}
          </span>
          <strong
            style={{
              display: "block",
              marginTop: 8,
              color: ink,
              fontSize: 26,
              fontWeight: 950,
              lineHeight: 0.9,
              fontFamily: "Georgia, Times New Roman, serif",
            }}
          >
            {badge.label}
          </strong>
          <p style={{ margin: "8px 0 0", color: "#27231e", fontSize: 13, fontWeight: 780, lineHeight: 1.12 }}>
            {badge.detail}
          </p>
        </div>
      </div>
    </div>
  );
};

const PipelineTrace = ({ config, track }: { config: FilmConfig; track: ReturnType<typeof buildTrack> }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [12, 154], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const point = getPointOnTrack(track, progress);
  const baseOpacity = interpolate(frame, [0, 16, 150, 166], [0, 0.86, 0.86, 0], clamp);
  const mask = config.masks.reduce((current, [start, end]) => Math.min(current, visibleOutsideRange(progress, start, end)), 1);
  const opacity = baseOpacity * mask;
  const scale = interpolate(frame % 24, [0, 12, 24], [0.9, 1.08, 0.9]);

  return (
    <>
      <polyline
        points={getTrackPoints(track, progress)}
        fill="none"
        stroke={config.accent}
        strokeWidth="8"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <circle cx={point.x} cy={point.y} r={13 * scale} fill={config.accent} stroke={ink} strokeWidth="2.5" opacity={opacity} />
      <circle cx={point.x} cy={point.y} r={20 * scale} fill="none" stroke={config.accentSoft} strokeWidth="6" opacity={opacity} />
    </>
  );
};

const FeedbackLoop = ({ config }: { config: FilmConfig }) => {
  const frame = useCurrentFrame();
  const loopOpacity = interpolate(frame, [112, 132], [0.28, 0.82], clamp);
  const firstStep = config.steps[0];
  const lastStep = config.steps[config.steps.length - 1];
  const returnStartX = Math.min(1188, lastStep.x + 126);
  const returnStartY = lastStep.y + 58;
  const returnEndX = Math.max(34, firstStep.x - 126);
  const returnEndY = firstStep.y + 58;
  const returnY = 700;
  const returnPath = [
    `M ${returnStartX} ${returnStartY}`,
    `C ${Math.min(1210, returnStartX + 48)} ${returnStartY + 72} ${returnStartX - 124} ${returnY} ${returnStartX - 260} ${returnY}`,
    `H ${returnEndX + 64}`,
    `C ${returnEndX + 18} ${returnY} ${returnEndX} ${returnEndY + 68} ${returnEndX} ${returnEndY}`,
  ].join(" ");
  const arrowId = `feedback-arrow-${config.issue}`;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <svg viewBox="0 0 1280 900" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <marker id={arrowId} markerHeight="18" markerUnits="userSpaceOnUse" markerWidth="18" orient="auto" refX="10" refY="5" viewBox="0 0 10 10">
            <path d="M0 0 L10 5 L0 10 z" fill={config.accent} />
          </marker>
        </defs>
        <path
          d={returnPath}
          fill="none"
          stroke="rgba(17,17,17,0.16)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={returnPath}
          fill="none"
          markerEnd={`url(#${arrowId})`}
          stroke={ink}
          strokeWidth="5.5"
          strokeLinecap="round"
          opacity={loopOpacity}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: Math.max(82, firstStep.x + 28),
          top: returnY - 52,
          color: config.accent,
          fontSize: 30,
          fontWeight: 950,
          textTransform: "uppercase",
        }}
      >
        Feedback path to next run
      </div>
    </div>
  );
};

const ResearchPipelineFilm = ({ config }: { config: FilmConfig }) => {
  const headlineIn = useReveal(0, 22);
  const track = buildTrack(config.segments);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: `radial-gradient(circle at 22% 14%, ${config.accentSoft}, transparent 260px), radial-gradient(circle at 82% 76%, rgba(17, 17, 17, 0.12), transparent 300px), repeating-linear-gradient(0deg, rgba(17,17,17,0.035) 0 1px, transparent 1px 5px), ${paper}`,
        fontFamily: "Apple SD Gothic Neo, Malgun Gothic, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 22,
          border: `3px solid ${ink}`,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.32), transparent 22%, transparent 78%, rgba(0,0,0,0.05)), rgba(247, 241, 226, 0.74)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 54,
          right: 54,
          top: 44,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: 24,
          transform: `translateY(${interpolate(headlineIn, [0, 1], [16, 0])}px)`,
          opacity: headlineIn,
        }}
      >
        <div>
          <div style={{ color: config.accent, fontSize: 26, fontWeight: 950, textTransform: "uppercase" }}>
            {config.eyebrow}
          </div>
          <h1
            style={{
              margin: "8px 0 0",
              color: ink,
              fontSize: 76,
              lineHeight: 0.96,
              fontFamily: "Georgia, Times New Roman, serif",
              fontWeight: 950,
              letterSpacing: 0,
            }}
          >
            {config.title}
          </h1>
        </div>
        <div
          style={{
            borderLeft: `3px solid ${ink}`,
            paddingLeft: 18,
            color: "#29251f",
            fontSize: 30,
            fontWeight: 820,
            lineHeight: 1.22,
            width: 430,
          }}
        >
          {config.description}
        </div>
      </div>

      <svg viewBox="0 0 1280 900" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path
          d={config.segments
            .map((segment, index) =>
              `${index === 0 ? `M${segment.start.x} ${segment.start.y}` : ""} C${segment.controlA.x} ${segment.controlA.y} ${segment.controlB.x} ${segment.controlB.y} ${segment.end.x} ${segment.end.y}`,
            )
            .join(" ")}
          fill="none"
          stroke="rgba(17,17,17,0.24)"
          strokeWidth="8"
          strokeLinecap="square"
        />
        <PipelineTrace config={config} track={track} />
      </svg>

      {config.steps.map((step, index) => (
        <StepNode key={step.label} step={step} index={index} accent={config.accent} />
      ))}
      {config.badges?.map((badge) => (
        <SideBadge key={badge.label} badge={badge} />
      ))}
      <FeedbackLoop config={config} />
    </AbsoluteFill>
  );
};

const aidlcConfig: FilmConfig = {
  eyebrow: "AIDLC Studio",
  title: "Prompt to Observable Work",
  issue: "01",
  description: "프롬프트와 프로젝트 상태를 실행, 승인, 산출물 타임라인으로 바꾸는 관측 가능한 개발 흐름.",
  accent: "#a9c716",
  accentSoft: "rgba(169, 199, 22, 0.18)",
  footer: "Prompt / files / agent run / approval gate / live timeline",
  steps: [
    {
      label: "Prompt",
      caption: "Work intake",
      detail: "Brief and intent",
      icon: { kind: "lucide", icon: MessageSquareText },
      x: 185,
      y: 402,
      from: 10,
    },
    {
      label: "Files",
      caption: "Project state",
      detail: "Repo context and diffs",
      icon: { kind: "lucide", icon: FolderGit2 },
      x: 420,
      y: 326,
      from: 38,
    },
    {
      label: "Agent Run",
      caption: "Execution",
      detail: "Phase tracking",
      icon: { kind: "lucide", icon: Bot },
      x: 655,
      y: 430,
      from: 72,
    },
    {
      label: "Approval",
      caption: "Human gate",
      detail: "Review before merge",
      icon: { kind: "lucide", icon: ShieldCheck },
      x: 890,
      y: 330,
      from: 108,
    },
    {
      label: "Timeline",
      caption: "Output",
      detail: "Artifacts and state",
      icon: { kind: "lucide", icon: GitBranch },
      x: 1125,
      y: 406,
      from: 136,
    },
  ],
  segments: [
    { start: { x: 185, y: 402 }, controlA: { x: 285, y: 282 }, controlB: { x: 350, y: 280 }, end: { x: 420, y: 326 } },
    { start: { x: 420, y: 326 }, controlA: { x: 505, y: 390 }, controlB: { x: 555, y: 498 }, end: { x: 655, y: 430 } },
    { start: { x: 655, y: 430 }, controlA: { x: 745, y: 362 }, controlB: { x: 793, y: 298 }, end: { x: 890, y: 330 } },
    { start: { x: 890, y: 330 }, controlA: { x: 970, y: 358 }, controlB: { x: 1035, y: 456 }, end: { x: 1125, y: 406 } },
  ],
  masks: [
    [0.08, 0.2],
    [0.25, 0.39],
    [0.47, 0.61],
    [0.68, 0.81],
    [0.87, 1],
  ],
  feedback: [
    { label: "Comments", x: 930, y: 576, from: 136 },
    { label: "Diff review", x: 700, y: 620, from: 148 },
    { label: "Next run", x: 470, y: 576, from: 160 },
  ],
  badges: [
    {
      label: "AWS",
      caption: "Runtime sidecar",
      detail: "Cloud deploy and infra lane",
      icon: faAws,
      color: "#ff9900",
      x: 1100,
      y: 274,
      from: 56,
    },
  ],
};

const loggerConfig: FilmConfig = {
  eyebrow: "Agent Conversation Logger",
  title: "Sessions to Work Memory",
  issue: "02",
  description: "Codex와 Claude Code의 대화, 도구 호출, 실행 흔적을 다음 실행이 참조할 기억으로 압축한다.",
  accent: "#176e82",
  accentSoft: "rgba(23, 110, 130, 0.18)",
  footer: "Sessions / hooks / normalize / privacy gate / archive",
  steps: [
    {
      label: "Codex",
      caption: "Session capture",
      detail: "Conversation events",
      icon: { kind: "brand", icon: faOpenai },
      color: "#111111",
      x: 185,
      y: 340,
      from: 10,
    },
    {
      label: "Claude",
      caption: "Second stream",
      detail: "Tool calls and traces",
      icon: { kind: "lucide", icon: MessagesSquare },
      x: 415,
      y: 462,
      from: 40,
    },
    {
      label: "Hooks",
      caption: "Lifecycle",
      detail: "Run boundaries",
      icon: { kind: "lucide", icon: Webhook },
      x: 645,
      y: 342,
      from: 74,
    },
    {
      label: "Normalize",
      caption: "Event grammar",
      detail: "JSONL-ready records",
      icon: { kind: "lucide", icon: FileJson },
      x: 875,
      y: 462,
      from: 106,
    },
    {
      label: "Archive",
      caption: "Memory layer",
      detail: "Obsidian and viewer",
      icon: { kind: "lucide", icon: Archive },
      x: 1105,
      y: 342,
      from: 138,
    },
  ],
  segments: [
    { start: { x: 185, y: 340 }, controlA: { x: 265, y: 395 }, controlB: { x: 335, y: 458 }, end: { x: 415, y: 462 } },
    { start: { x: 415, y: 462 }, controlA: { x: 500, y: 462 }, controlB: { x: 555, y: 316 }, end: { x: 645, y: 342 } },
    { start: { x: 645, y: 342 }, controlA: { x: 725, y: 370 }, controlB: { x: 775, y: 470 }, end: { x: 875, y: 462 } },
    { start: { x: 875, y: 462 }, controlA: { x: 960, y: 455 }, controlB: { x: 1015, y: 315 }, end: { x: 1105, y: 342 } },
  ],
  masks: [
    [0.05, 0.18],
    [0.24, 0.38],
    [0.46, 0.6],
    [0.67, 0.81],
    [0.88, 1],
  ],
  feedback: [
    { label: "Privacy gate", x: 900, y: 576, from: 136 },
    { label: "Prompt coaching", x: 670, y: 620, from: 148 },
    { label: "Next template", x: 450, y: 576, from: 160 },
  ],
};

const contentConfig: FilmConfig = {
  eyebrow: "Data-to-Content Workflow",
  title: "Signal to Publishable Draft",
  issue: "03",
  description: "흩어진 리서치 신호를 수집, 구조화, 생성, 검증해 발행 가능한 브리프와 초안으로 바꾼다.",
  accent: "#c88b14",
  accentSoft: "rgba(200, 139, 20, 0.2)",
  footer: "Signals / collect / structure / generate / publish queue",
  steps: [
    {
      label: "Signals",
      caption: "Research input",
      detail: "Sources and saved notes",
      icon: { kind: "lucide", icon: Radar },
      x: 185,
      y: 418,
      from: 10,
    },
    {
      label: "Collect",
      caption: "Data capture",
      detail: "Context archive",
      icon: { kind: "lucide", icon: DatabaseZap },
      x: 415,
      y: 336,
      from: 38,
    },
    {
      label: "Structure",
      caption: "Meaning sieve",
      detail: "Sort into arguments",
      icon: { kind: "lucide", icon: Network },
      x: 645,
      y: 438,
      from: 72,
    },
    {
      label: "Generate",
      caption: "Synthesis desk",
      detail: "Brief draft",
      icon: { kind: "lucide", icon: PenLine },
      x: 875,
      y: 338,
      from: 106,
    },
    {
      label: "Publish",
      caption: "Queue",
      detail: "Note and reuse score",
      icon: { kind: "lucide", icon: Newspaper },
      x: 1125,
      y: 420,
      from: 138,
    },
  ],
  segments: [
    { start: { x: 185, y: 418 }, controlA: { x: 265, y: 330 }, controlB: { x: 335, y: 306 }, end: { x: 415, y: 336 } },
    { start: { x: 415, y: 336 }, controlA: { x: 490, y: 372 }, controlB: { x: 545, y: 456 }, end: { x: 645, y: 438 } },
    { start: { x: 645, y: 438 }, controlA: { x: 735, y: 420 }, controlB: { x: 785, y: 312 }, end: { x: 875, y: 338 } },
    { start: { x: 875, y: 338 }, controlA: { x: 965, y: 366 }, controlB: { x: 1035, y: 454 }, end: { x: 1125, y: 420 } },
  ],
  masks: [
    [0.05, 0.18],
    [0.25, 0.38],
    [0.47, 0.6],
    [0.68, 0.81],
    [0.88, 1],
  ],
  feedback: [
    { label: "Validation", x: 900, y: 576, from: 136 },
    { label: "Reuse score", x: 680, y: 620, from: 148 },
    { label: "Publishing queue", x: 460, y: 576, from: 160 },
  ],
};

export const AIDLCStudioPipeline = () => <ResearchPipelineFilm config={aidlcConfig} />;
export const AgentConversationLoggerPipeline = () => <ResearchPipelineFilm config={loggerConfig} />;
export const DataToContentPipeline = () => <ResearchPipelineFilm config={contentConfig} />;
