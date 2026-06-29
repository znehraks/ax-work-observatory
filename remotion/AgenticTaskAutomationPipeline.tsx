import { faGithub, faJira, faOpenai, faSlack } from "@fortawesome/free-brands-svg-icons";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const ink = "#111111";
const red = "#ce0d08";
const muted = "#615b50";

const steps = [
  {
    key: "slack",
    label: "Slack",
    caption: "Signal intake",
    detail: "Alert, thread, runtime pulse",
    icon: faSlack,
    color: "#4A154B",
    x: 170,
    y: 404,
    from: 10,
  },
  {
    key: "jira",
    label: "Jira",
    caption: "Issue triage",
    detail: "Classify risk and scope",
    icon: faJira,
    color: "#0052CC",
    x: 425,
    y: 332,
    from: 42,
  },
  {
    key: "codex",
    label: "Codex",
    caption: "Plan + worker run",
    detail: "Draft fix behind approval",
    icon: faOpenai,
    color: "#111111",
    x: 690,
    y: 418,
    from: 82,
  },
  {
    key: "github",
    label: "GitHub",
    caption: "Draft PR",
    detail: "PR, audit note, status update",
    icon: faGithub,
    color: "#181717",
    x: 1018,
    y: 344,
    from: 124,
  },
] as const;

const audits = [
  { label: "CI gates", x: 615, from: 142 },
  { label: "Completion audit", x: 800, from: 158 },
  { label: "Human review", x: 1000, from: 174 },
];

type Point = {
  x: number;
  y: number;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const pipelineSegments = [
  {
    start: { x: 170, y: 404 },
    controlA: { x: 260, y: 310 },
    controlB: { x: 335, y: 303 },
    end: { x: 425, y: 332 },
  },
  {
    start: { x: 425, y: 332 },
    controlA: { x: 515, y: 361 },
    controlB: { x: 585, y: 502 },
    end: { x: 690, y: 418 },
  },
  {
    start: { x: 690, y: 418 },
    controlA: { x: 795, y: 334 },
    controlB: { x: 875, y: 274 },
    end: { x: 1018, y: 344 },
  },
] as const;

const cubicPoint = (segment: (typeof pipelineSegments)[number], t: number): Point => {
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

const buildPipelineSamples = () => {
  const samples: Array<Point & { length: number }> = [];
  let totalLength = 0;
  let previous: Point | null = null;

  for (const segment of pipelineSegments) {
    for (let index = 0; index <= 160; index += 1) {
      if (samples.length > 0 && index === 0) {
        continue;
      }

      const point = cubicPoint(segment, index / 160);

      if (previous) {
        totalLength += Math.hypot(point.x - previous.x, point.y - previous.y);
      }

      samples.push({ ...point, length: totalLength });
      previous = point;
    }
  }

  return { samples, totalLength };
};

const pipelineTrack = buildPipelineSamples();

const getPointOnPipeline = (progress: number): Point => {
  const targetLength = Math.max(0, Math.min(1, progress)) * pipelineTrack.totalLength;
  const nextIndex = pipelineTrack.samples.findIndex((sample) => sample.length >= targetLength);

  if (nextIndex <= 0) {
    return pipelineTrack.samples[0];
  }

  const previous = pipelineTrack.samples[nextIndex - 1];
  const next = pipelineTrack.samples[nextIndex] ?? pipelineTrack.samples[pipelineTrack.samples.length - 1];
  const span = Math.max(next.length - previous.length, 0.0001);
  const mix = (targetLength - previous.length) / span;

  return {
    x: previous.x + (next.x - previous.x) * mix,
    y: previous.y + (next.y - previous.y) * mix,
  };
};

const getPipelinePoints = (progress: number) => {
  const targetLength = Math.max(0, Math.min(1, progress)) * pipelineTrack.totalLength;
  const visibleSamples = pipelineTrack.samples.filter((sample) => sample.length <= targetLength);
  const point = getPointOnPipeline(progress);

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

type BrandIcon = (typeof steps)[number]["icon"];

const IconMark = ({ icon, color }: { icon: BrandIcon; color: string }) => {
  const [width, height, , , pathData] = icon.icon;
  const paths = Array.isArray(pathData) ? pathData : [pathData];

  return (
    <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} style={{ width: 62, height: 62, display: "block" }}>
      {paths.map((path, index) => (
        <path key={`${icon.iconName}-${index}`} d={path} fill={color} />
      ))}
    </svg>
  );
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

const StepNode = ({ step, index }: { step: (typeof steps)[number]; index: number }) => {
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
        width: 202,
        transform: `translate(-50%, -50%) translateY(${lift}px)`,
        opacity: reveal,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -18,
          border: `2px solid ${step.color}`,
          opacity: pulse * 0.3,
          transform: `scale(${1 + pulse * 0.26})`,
        }}
      />
      <div
        style={{
          border: `2px solid ${ink}`,
          background: "rgba(247, 241, 226, 0.98)",
          boxShadow: "0 16px 0 rgba(17, 17, 17, 0.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "74px 1fr",
            minHeight: 110,
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              borderRight: `2px solid ${ink}`,
              background: index === 2 ? "#f8f2e6" : "rgba(255, 255, 255, 0.26)",
            }}
          >
            <IconMark icon={step.icon} color={step.color} />
          </div>
          <div style={{ padding: "12px 12px 10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <span
                style={{
                  color: red,
                  fontSize: 18,
                  fontWeight: 950,
                  lineHeight: 1,
                  fontFamily: "Arial Black, Helvetica, sans-serif",
                }}
              >
                {serial}
              </span>
              <span
                style={{
                  color: muted,
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                {step.caption}
              </span>
            </div>
            <strong
              style={{
                display: "block",
                marginTop: 11,
                color: ink,
                fontSize: 27,
                fontWeight: 950,
                lineHeight: 0.9,
                fontFamily: "Georgia, Times New Roman, serif",
              }}
            >
              {step.label}
            </strong>
            <p
              style={{
                margin: "9px 0 0",
                color: "#27231e",
                fontSize: 14,
                fontWeight: 760,
                lineHeight: 1.18,
              }}
            >
              {step.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PipelineTrace = () => {
  const frame = useCurrentFrame();
  const lineProgress = interpolate(frame, [12, 154], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const point = getPointOnPipeline(lineProgress);
  const baseOpacity = interpolate(frame, [0, 16, 150, 166], [0, 0.86, 0.86, 0], clamp);
  const cardMask = Math.min(
    visibleOutsideRange(lineProgress, 0.14, 0.32),
    visibleOutsideRange(lineProgress, 0.5, 0.68),
    visibleOutsideRange(lineProgress, 0.82, 0.98),
  );
  const opacity = baseOpacity * cardMask;
  const scale = interpolate(frame % 24, [0, 12, 24], [0.9, 1.08, 0.9]);

  return (
    <>
      <polyline
        points={getPipelinePoints(lineProgress)}
        fill="none"
        stroke={red}
        strokeWidth="8"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <circle cx={point.x} cy={point.y} r={13 * scale} fill={red} stroke={ink} strokeWidth="2.5" opacity={opacity} />
      <circle cx={point.x} cy={point.y} r={20 * scale} fill="none" stroke="rgba(206, 13, 8, 0.1)" strokeWidth="6" opacity={opacity} />
    </>
  );
};

const AuditLoop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rail = interpolate(frame, [136, 186], [0, 1], clamp);
  const returnFade = interpolate(frame, [172, 198], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", left: 236, right: 110, bottom: 96, height: 132 }}>
      <svg viewBox="0 0 930 132" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path
          d="M70 54 H820 Q878 54 878 92 H88 Q42 92 42 48"
          fill="none"
          stroke={ink}
          strokeWidth="4"
          strokeDasharray={`${rail * 1180} 1180`}
          strokeLinecap="square"
          opacity="0.82"
        />
        <path d="M47 46 l-22 -8 l8 22" fill="none" stroke={ink} strokeWidth="4" opacity={returnFade * 0.78} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 18,
          color: red,
          fontSize: 13,
          fontWeight: 950,
          textTransform: "uppercase",
        }}
      >
        Return loop
      </div>
      {audits.map((audit, index) => {
        const reveal = spring({
          frame: frame - audit.from,
          fps,
          durationInFrames: 16,
          config: { damping: 18, stiffness: 170 },
        });
        return (
          <div
            key={audit.label}
            style={{
              position: "absolute",
              left: audit.x,
              top: index === 1 ? 70 : 28,
              minWidth: 130,
              transform: `translateX(-50%) translateY(${interpolate(reveal, [0, 1], [12, 0])}px)`,
              opacity: reveal,
              border: `1px solid ${ink}`,
              background: "rgba(247, 241, 226, 0.94)",
              padding: "10px 12px",
              color: ink,
              fontSize: 15,
              fontWeight: 880,
              textAlign: "center",
              boxShadow: "5px 5px 0 rgba(17, 17, 17, 0.1)",
            }}
          >
            {audit.label}
          </div>
        );
      })}
    </div>
  );
};

export const AgenticTaskAutomationPipeline = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 188], [0, 1], clamp);
  const headlineIn = useReveal(0, 22);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 22% 14%, rgba(206, 13, 8, 0.16), transparent 260px), radial-gradient(circle at 82% 76%, rgba(17, 17, 17, 0.12), transparent 300px), repeating-linear-gradient(0deg, rgba(17,17,17,0.035) 0 1px, transparent 1px 5px), #efe8d8",
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
          <div style={{ color: red, fontSize: 18, fontWeight: 950, textTransform: "uppercase" }}>
            24/7 Agentic Task Automation
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
            Alert to Draft PR
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
          Slack/Jira 신호를 분류하고, 승인 가능한 작업 단위로 바꾼 뒤 GitHub Draft PR까지 보낸다.
        </div>
      </div>

      <svg viewBox="0 0 1280 900" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path
          d="M170 404 C260 310 335 303 425 332 S585 502 690 418 S875 274 1018 344"
          fill="none"
          stroke="rgba(17,17,17,0.24)"
          strokeWidth="8"
          strokeLinecap="square"
        />
        <PipelineTrace />
        <path
          d="M284 532 H996"
          stroke={ink}
          strokeWidth="2"
          strokeDasharray="10 9"
          opacity={0.18 + progress * 0.34}
        />
      </svg>

      {steps.map((step, index) => (
        <StepNode key={step.key} step={step} index={index} />
      ))}
      <AuditLoop />

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
        <span style={{ width: 44, height: 8, background: red, display: "block" }} />
        Intake classify / Plan / Approval gate / Worker run / Audit
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
        {String(Math.max(1, Math.ceil(progress * 5))).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};
