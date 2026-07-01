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
    x: 210,
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
    x: 465,
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
    x: 730,
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
    x: 1058,
    y: 344,
    from: 124,
  },
] as const;

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

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const pipelineSegments: Segment[] = [
  {
    start: { x: 210, y: 404 },
    controlA: { x: 300, y: 310 },
    controlB: { x: 375, y: 303 },
    end: { x: 465, y: 332 },
  },
  {
    start: { x: 465, y: 332 },
    controlA: { x: 555, y: 361 },
    controlB: { x: 625, y: 502 },
    end: { x: 730, y: 418 },
  },
  {
    start: { x: 730, y: 418 },
    controlA: { x: 835, y: 334 },
    controlB: { x: 915, y: 274 },
    end: { x: 1058, y: 344 },
  },
];

const getReturnGeometry = () => {
  const firstStep = steps[0];
  const lastStep = steps[steps.length - 1];
  const returnStartX = Math.min(1188, lastStep.x + 132);
  const returnStartY = lastStep.y + 58;
  const returnEndX = Math.max(34, firstStep.x - 132);
  const returnEndY = firstStep.y + 58;
  const returnY = 700;

  return { firstStep, returnStartX, returnStartY, returnEndX, returnEndY, returnY };
};

const getConnectedLoopSegments = (): Segment[] => {
  const firstSegment = pipelineSegments[0];
  const lastSegment = pipelineSegments[pipelineSegments.length - 1];
  const { returnStartX, returnStartY, returnEndX, returnEndY, returnY } = getReturnGeometry();
  const lowerRight = { x: returnStartX - 260, y: returnY };
  const lowerLeft = { x: returnEndX + 64, y: returnY };

  return [
    ...pipelineSegments,
    {
      start: lastSegment.end,
      controlA: { x: lastSegment.end.x + 34, y: lastSegment.end.y + 8 },
      controlB: { x: returnStartX, y: returnStartY - 42 },
      end: { x: returnStartX, y: returnStartY },
    },
    {
      start: { x: returnStartX, y: returnStartY },
      controlA: { x: Math.min(1210, returnStartX + 48), y: returnStartY + 72 },
      controlB: { x: returnStartX - 124, y: returnY },
      end: lowerRight,
    },
    {
      start: lowerRight,
      controlA: { x: returnStartX - 420, y: returnY },
      controlB: { x: returnEndX + 220, y: returnY },
      end: lowerLeft,
    },
    {
      start: lowerLeft,
      controlA: { x: returnEndX + 18, y: returnY },
      controlB: { x: returnEndX, y: returnEndY + 68 },
      end: { x: returnEndX, y: returnEndY },
    },
    {
      start: { x: returnEndX, y: returnEndY },
      controlA: { x: returnEndX, y: returnEndY - 36 },
      controlB: { x: firstSegment.start.x - 92, y: firstSegment.start.y + 10 },
      end: firstSegment.start,
    },
  ];
};

const connectedLoopSegments = getConnectedLoopSegments();

const getSegmentsPath = (segments: Segment[]) =>
  segments
    .map((segment, index) =>
      `${index === 0 ? `M${segment.start.x} ${segment.start.y}` : ""} C${segment.controlA.x} ${segment.controlA.y} ${segment.controlB.x} ${segment.controlB.y} ${segment.end.x} ${segment.end.y}`,
    )
    .join(" ");

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

const buildPipelineSamples = () => {
  const samples: Array<Point & { length: number }> = [];
  let totalLength = 0;
  let previous: Point | null = null;

  for (const segment of connectedLoopSegments) {
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

type BrandIcon = (typeof steps)[number]["icon"];

const IconMark = ({ icon, color }: { icon: BrandIcon; color: string }) => {
  const [width, height, , , pathData] = icon.icon;
  const paths = Array.isArray(pathData) ? pathData : [pathData];

  return (
    <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} style={{ width: 76, height: 76, display: "block" }}>
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
        width: 260,
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
            gridTemplateColumns: "92px 1fr",
            minHeight: 144,
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
                  fontSize: 26,
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
                  fontSize: 14,
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
                fontSize: 38,
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
                fontSize: 17,
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
  const opacity = baseOpacity;
  const scale = interpolate(frame % 24, [0, 12, 24], [0.9, 1.08, 0.9]);

  return (
    <>
      <polyline
        points={getPipelinePoints(lineProgress)}
        fill="none"
        stroke={red}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={point.x} cy={point.y} r={13 * scale} fill={red} stroke={ink} strokeWidth="2.5" opacity={opacity} />
      <circle cx={point.x} cy={point.y} r={20 * scale} fill="none" stroke="rgba(206, 13, 8, 0.1)" strokeWidth="6" opacity={opacity} />
    </>
  );
};

const AuditLoop = () => {
  const { firstStep, returnY } = getReturnGeometry();

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <div
        style={{
          position: "absolute",
          left: Math.max(82, firstStep.x + 28),
          top: returnY - 52,
          color: red,
          fontSize: 30,
          fontWeight: 950,
          textTransform: "uppercase",
        }}
      >
        Feedback path to intake
      </div>
    </div>
  );
};

export const AgenticTaskAutomationPipeline = () => {
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
          <div style={{ color: red, fontSize: 26, fontWeight: 950, textTransform: "uppercase" }}>
            24/7 Agentic Task Automation
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
            Alert to Draft PR
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
          Slack/Jira 신호를 분류하고, 승인 가능한 작업 단위로 바꾼 뒤 GitHub Draft PR까지 보낸다.
        </div>
      </div>

      <svg viewBox="0 0 1280 900" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path
          d={getSegmentsPath(connectedLoopSegments)}
          fill="none"
          stroke="rgba(17,17,17,0.24)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <PipelineTrace />
      </svg>

      {steps.map((step, index) => (
        <StepNode key={step.key} step={step} index={index} />
      ))}
      <AuditLoop />
    </AbsoluteFill>
  );
};
