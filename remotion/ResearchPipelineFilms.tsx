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

type FilmStep = {
  label: string;
  caption: string;
  detail: string;
  mark: string;
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

const StepNode = ({ step, index, accent }: { step: FilmStep; index: number; accent: string }) => {
  const frame = useCurrentFrame();
  const reveal = useReveal(step.from);
  const pulse = interpolate(frame, [step.from, step.from + 16, step.from + 34], [0, 1, 0.18], clamp);
  const lift = interpolate(reveal, [0, 1], [22, 0]);
  const serial = String(index + 1).padStart(2, "0");

  return (
    <div
      style={{
        position: "absolute",
        left: step.x,
        top: step.y,
        zIndex: 3,
        width: 212,
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
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", minHeight: 112 }}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              borderRight: `2px solid ${ink}`,
              background: "rgba(255, 255, 255, 0.3)",
              color: accent,
              fontSize: 26,
              fontWeight: 950,
              fontFamily: "Arial Black, Helvetica, sans-serif",
              lineHeight: 1,
            }}
          >
            {step.mark}
          </div>
          <div style={{ padding: "12px 12px 10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <span
                style={{
                  color: accent,
                  fontSize: 18,
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
                  fontSize: 11,
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
                fontSize: 25,
                fontWeight: 950,
                lineHeight: 0.95,
                fontFamily: "Georgia, Times New Roman, serif",
              }}
            >
              {step.label}
            </strong>
            <p style={{ margin: "8px 0 0", color: "#27231e", fontSize: 13, fontWeight: 760, lineHeight: 1.16 }}>
              {step.detail}
            </p>
          </div>
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
  const { fps } = useVideoConfig();
  const rail = interpolate(frame, [138, 188], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", left: 210, right: 120, bottom: 96, height: 142 }}>
      <svg viewBox="0 0 950 142" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path
          d="M58 48 H830 Q892 48 892 94 H92 Q40 94 40 52"
          fill="none"
          stroke={ink}
          strokeWidth="4"
          strokeDasharray={`${rail * 1190} 1190`}
          strokeLinecap="square"
          opacity="0.72"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 18,
          color: config.accent,
          fontSize: 13,
          fontWeight: 950,
          textTransform: "uppercase",
        }}
      >
        Return loop
      </div>
      {config.feedback.map((item) => {
        const reveal = spring({
          frame: frame - item.from,
          fps,
          durationInFrames: 16,
          config: { damping: 18, stiffness: 170 },
        });

        return (
          <div
            key={item.label}
            style={{
              position: "absolute",
              left: item.x,
              top: item.y,
              minWidth: 128,
              transform: `translateX(-50%) translateY(${interpolate(reveal, [0, 1], [12, 0])}px)`,
              opacity: reveal,
              border: `1px solid ${ink}`,
              background: "rgba(247, 241, 226, 0.94)",
              padding: "10px 12px",
              color: ink,
              fontSize: 14,
              fontWeight: 880,
              textAlign: "center",
              boxShadow: "5px 5px 0 rgba(17, 17, 17, 0.1)",
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

const ResearchPipelineFilm = ({ config }: { config: FilmConfig }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 188], [0, 1], clamp);
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
          inset: 34,
          border: `3px solid ${ink}`,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.32), transparent 22%, transparent 78%, rgba(0,0,0,0.05)), rgba(247, 241, 226, 0.74)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 68,
          right: 68,
          top: 58,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: 24,
          transform: `translateY(${interpolate(headlineIn, [0, 1], [16, 0])}px)`,
          opacity: headlineIn,
        }}
      >
        <div>
          <div style={{ color: config.accent, fontSize: 18, fontWeight: 950, textTransform: "uppercase" }}>
            {config.eyebrow}
          </div>
          <h1
            style={{
              margin: "8px 0 0",
              color: ink,
              fontSize: 58,
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
            fontSize: 18,
            fontWeight: 820,
            lineHeight: 1.22,
            width: 318,
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
        <path d="M284 532 H996" stroke={ink} strokeWidth="2" strokeDasharray="10 9" opacity={0.18 + progress * 0.34} />
      </svg>

      {config.steps.map((step, index) => (
        <StepNode key={step.label} step={step} index={index} accent={config.accent} />
      ))}
      <FeedbackLoop config={config} />

      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 58,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: muted,
          fontSize: 15,
          fontWeight: 820,
          textTransform: "uppercase",
        }}
      >
        <span style={{ width: 44, height: 8, background: config.accent, display: "block" }} />
        {config.footer}
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: 54,
          color: "rgba(17,17,17,0.34)",
          fontFamily: "Georgia, Times New Roman, serif",
          fontSize: 54,
          fontWeight: 950,
        }}
      >
        {config.issue}
      </div>
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
    { label: "Prompt", caption: "Work intake", detail: "Brief and intent", mark: "P", x: 165, y: 402, from: 10 },
    { label: "Files", caption: "Project state", detail: "Repo context and diffs", mark: "F", x: 365, y: 326, from: 38 },
    { label: "Agent Run", caption: "Execution", detail: "Phase tracking", mark: "R", x: 590, y: 430, from: 72 },
    { label: "Approval", caption: "Human gate", detail: "Review before merge", mark: "OK", x: 805, y: 330, from: 108 },
    { label: "Timeline", caption: "Observable output", detail: "Artifacts and state", mark: "T", x: 1035, y: 406, from: 136 },
  ],
  segments: [
    { start: { x: 165, y: 402 }, controlA: { x: 260, y: 282 }, controlB: { x: 305, y: 280 }, end: { x: 365, y: 326 } },
    { start: { x: 365, y: 326 }, controlA: { x: 450, y: 390 }, controlB: { x: 500, y: 498 }, end: { x: 590, y: 430 } },
    { start: { x: 590, y: 430 }, controlA: { x: 680, y: 362 }, controlB: { x: 708, y: 298 }, end: { x: 805, y: 330 } },
    { start: { x: 805, y: 330 }, controlA: { x: 890, y: 358 }, controlB: { x: 945, y: 456 }, end: { x: 1035, y: 406 } },
  ],
  masks: [
    [0.08, 0.2],
    [0.25, 0.39],
    [0.47, 0.61],
    [0.68, 0.81],
    [0.87, 1],
  ],
  feedback: [
    { label: "Comments", x: 555, y: 34, from: 144 },
    { label: "Diff review", x: 750, y: 82, from: 160 },
    { label: "Next run", x: 960, y: 38, from: 176 },
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
    { label: "Codex", caption: "Session capture", detail: "Conversation events", mark: "C", x: 160, y: 340, from: 10 },
    { label: "Claude", caption: "Second stream", detail: "Tool calls and traces", mark: "CL", x: 330, y: 462, from: 40 },
    { label: "Hooks", caption: "Lifecycle", detail: "Run boundaries", mark: "H", x: 535, y: 342, from: 74 },
    { label: "Normalize", caption: "Event grammar", detail: "JSONL-ready records", mark: "N", x: 748, y: 462, from: 106 },
    { label: "Archive", caption: "Memory layer", detail: "Obsidian and viewer", mark: "A", x: 990, y: 342, from: 138 },
  ],
  segments: [
    { start: { x: 160, y: 340 }, controlA: { x: 225, y: 395 }, controlB: { x: 258, y: 458 }, end: { x: 330, y: 462 } },
    { start: { x: 330, y: 462 }, controlA: { x: 405, y: 462 }, controlB: { x: 460, y: 316 }, end: { x: 535, y: 342 } },
    { start: { x: 535, y: 342 }, controlA: { x: 610, y: 370 }, controlB: { x: 650, y: 470 }, end: { x: 748, y: 462 } },
    { start: { x: 748, y: 462 }, controlA: { x: 840, y: 455 }, controlB: { x: 895, y: 315 }, end: { x: 990, y: 342 } },
  ],
  masks: [
    [0.05, 0.18],
    [0.24, 0.38],
    [0.46, 0.6],
    [0.67, 0.81],
    [0.88, 1],
  ],
  feedback: [
    { label: "Privacy gate", x: 560, y: 34, from: 144 },
    { label: "Prompt coaching", x: 770, y: 82, from: 160 },
    { label: "Next template", x: 978, y: 36, from: 176 },
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
    { label: "Signals", caption: "Research input", detail: "Sources and saved notes", mark: "S", x: 160, y: 418, from: 10 },
    { label: "Collect", caption: "Data capture", detail: "Context archive", mark: "C", x: 365, y: 336, from: 38 },
    { label: "Structure", caption: "Meaning sieve", detail: "Sort into arguments", mark: "ST", x: 575, y: 438, from: 72 },
    { label: "Generate", caption: "Synthesis desk", detail: "Brief and article draft", mark: "G", x: 790, y: 338, from: 106 },
    { label: "Publish", caption: "Queue", detail: "Note and reuse score", mark: "P", x: 1015, y: 420, from: 138 },
  ],
  segments: [
    { start: { x: 160, y: 418 }, controlA: { x: 235, y: 330 }, controlB: { x: 300, y: 306 }, end: { x: 365, y: 336 } },
    { start: { x: 365, y: 336 }, controlA: { x: 440, y: 372 }, controlB: { x: 480, y: 456 }, end: { x: 575, y: 438 } },
    { start: { x: 575, y: 438 }, controlA: { x: 660, y: 420 }, controlB: { x: 700, y: 312 }, end: { x: 790, y: 338 } },
    { start: { x: 790, y: 338 }, controlA: { x: 880, y: 366 }, controlB: { x: 925, y: 454 }, end: { x: 1015, y: 420 } },
  ],
  masks: [
    [0.05, 0.18],
    [0.25, 0.38],
    [0.47, 0.6],
    [0.68, 0.81],
    [0.88, 1],
  ],
  feedback: [
    { label: "Validation", x: 560, y: 34, from: 144 },
    { label: "Reuse score", x: 770, y: 82, from: 160 },
    { label: "Publishing queue", x: 978, y: 36, from: 176 },
  ],
};

export const AIDLCStudioPipeline = () => <ResearchPipelineFilm config={aidlcConfig} />;
export const AgentConversationLoggerPipeline = () => <ResearchPipelineFilm config={loggerConfig} />;
export const DataToContentPipeline = () => <ResearchPipelineFilm config={contentConfig} />;
