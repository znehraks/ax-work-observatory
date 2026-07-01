"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import { flowNodes, researchTracks } from "@/content/research";
import type { ResearchTrack } from "@/content/research";

const dispatchFilms: Record<
  string,
  {
    src: string;
    labels: string[];
  }
> = {
  "aidlc-studio": {
    src: "/media/aidlc-studio.mp4?v=20260701-aidlc-line-fix",
    labels: ["Prompt", "Files", "Agent Run", "Approval", "Timeline"],
  },
  "agent-conversation-logger": {
    src: "/media/agent-conversation-logger.mp4?v=20260701-clean-focus-shifted",
    labels: ["Codex", "Claude", "Hooks", "Normalize", "Archive"],
  },
  "data-to-content-workflow": {
    src: "/media/data-to-content-workflow.mp4?v=20260701-clean-focus-shifted",
    labels: ["Signals", "Collect", "Structure", "Generate", "Publish"],
  },
  "agentic-task-automation": {
    src: "/media/agentic-task-automation.mp4?v=20260701-clean-focus-shifted",
    labels: ["Slack Signal", "Jira Triage", "Codex Worker", "GitHub PR"],
  },
};

export function ObservatoryHome() {
  const [activeId, setActiveId] = useState(researchTracks[0].id);
  const [isPrinting, setIsPrinting] = useState(true);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [turnId, setTurnId] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const isMotionActive = isPrinting && !prefersReducedMotion;
  const activeTrack =
    researchTracks.find((track) => track.id === activeId) ?? researchTracks[0];
  const activeArticle = activeTrack.article;
  const expandedTrack = expandedTrackId
    ? researchTracks.find((track) => track.id === expandedTrackId)
    : null;
  const selectTrack = (trackId: string) => {
    if (trackId === activeId) {
      return;
    }

    setActiveId(trackId);
    setTurnId((value) => value + 1);
  };

  return (
    <main className="newspaper-shell">
      <motion.article
        className={`newspaper-page ${isMotionActive ? "is-printing" : "is-paused"}`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <Header />
        <NewsWire activeTrack={activeTrack} />

        <section className="front-page" id="cover-story">
          {turnId > 0 ? (
            <motion.div
              className="page-turn-sheet"
              key={turnId}
              initial={{ x: "106%", opacity: 0, rotateY: -30, skewX: -5 }}
              animate={{
                x: ["106%", "16%", "-106%"],
                opacity: [0, 0.9, 0],
                rotateY: [-30, -8, 0],
                skewX: [-5, -1, 0],
              }}
              transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            />
          ) : null}
          <motion.section
            className="cover-column"
            key={`cover-${activeTrack.id}`}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
          >
            <span className="rubric">Cover Story</span>
            <ArticleHeadline lines={activeArticle.headline} />
            <p>{activeArticle.lead}</p>
            <a className="read-link" href="#research-dispatch">
              Read the Dispatch
            </a>
          </motion.section>

          <section className="main-story">
            <ResearchPhoto
              key={activeTrack.id}
              activeTrack={activeTrack}
              isPrinting={isMotionActive}
              onOpenDetails={() => setExpandedTrackId(activeTrack.id)}
            />
            <AnimatePresence mode="wait">
              <motion.div
                className="article-content"
                key={`article-${activeTrack.id}`}
                initial={{ opacity: 0, y: 12, rotateX: -4 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -8, rotateX: 3 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="issue-copy">
                  <span>In This Dispatch</span>
                  <p>{activeArticle.issueBody}</p>
                </div>
                <div className="issue-card-grid" id="notes">
                  {activeArticle.cards.map((card) => (
                    <article key={card.title}>
                      <h2>{card.title}</h2>
                      <p>{card.copy}</p>
                    </article>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </section>

          <aside className="dispatch-column" id="research-dispatch">
            <div className="dispatch-head">
              <span>Research Dispatch</span>
              <button
                className="print-toggle"
                type="button"
                onClick={() => setIsPrinting((value) => !value)}
                aria-label={isMotionActive ? "Pause newspaper motion" : "Resume newspaper motion"}
              >
                {isMotionActive ? <Pause size={15} /> : <Play size={15} />}
              </button>
            </div>

            <div className="dispatch-list">
              {researchTracks.map((track, index) => (
                <button
                  className="dispatch-item"
                  key={track.id}
                  type="button"
                  data-active={track.id === activeTrack.id}
                  data-track-id={track.id}
                  onClick={() => selectTrack(track.id)}
                  style={
                    {
                      "--dispatch-accent": track.accent,
                    } as CSSProperties
                  }
                >
                  <span className="dispatch-image" aria-hidden="true">
                    <span />
                    <i />
                  </span>
                  <span className="dispatch-body">
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <strong>{track.title}</strong>
                    <small>{track.summary}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="editors-note" id="profile">
              <span>Editor&apos;s Note</span>
              <h2>기록은 시스템이 되고, 시스템은 문화가 됩니다.</h2>
              <p>
                AX Work Observatory는 관측의 언어로 일의 미래를 함께 쓰는 독립
                연구 매체입니다.
              </p>
              <a href="#archive">About the Editor</a>
            </div>
          </aside>

          <aside className="issue-spine" aria-hidden="true">
            <span>Spring 2026</span>
            <strong>AXWO</strong>
          </aside>
        </section>

        <section className="below-fold" id="archive">
          <div className="archive-heading">
            <span>Field Report</span>
            <h2>실행 로그를 기사처럼 읽을 수 있게 만듭니다.</h2>
          </div>
          <div className="archive-grid">
            <AnimatePresence mode="wait">
              <motion.article
                className="active-brief"
                key={activeTrack.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                <span>{activeTrack.lane}</span>
                <h3>{activeTrack.title}</h3>
                <p>{activeTrack.question}</p>
                <dl>
                  <div>
                    <dt>Input</dt>
                    <dd>{activeTrack.input.join(" / ")}</dd>
                  </div>
                  <div>
                    <dt>Process</dt>
                    <dd>{activeTrack.process.join(" / ")}</dd>
                  </div>
                  <div>
                    <dt>Artifact</dt>
                    <dd>{activeTrack.artifact.join(" / ")}</dd>
                  </div>
                </dl>
              </motion.article>
            </AnimatePresence>

            <div className="workflow-strip" aria-label="Workflow grammar">
              {flowNodes.map((node, index) => (
                <motion.button
                  type="button"
                  key={node.label}
                  className="workflow-token"
                  animate={
                    isMotionActive
                      ? { opacity: [0.48, 1, 0.48] }
                      : { opacity: 0.62 }
                  }
                  transition={{
                    duration: 2.4,
                    delay: index * 0.16,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {node.label}
                </motion.button>
              ))}
            </div>
          </div>

          <footer className="newspaper-footer">
            <span>AXWO Journal</span>
            <span>ISSN 2988-2026</span>
            <span>Published by AX Work Observatory</span>
          </footer>
        </section>

        <AnimatePresence>
          {expandedTrack ? (
            <MachineDetailOverlay
              activeTrack={expandedTrack}
              isPrinting={isMotionActive}
              onClose={() => setExpandedTrackId(null)}
            />
          ) : null}
        </AnimatePresence>
      </motion.article>
    </main>
  );
}

function ArticleHeadline({ lines }: { lines: string[] }) {
  const normalLines = lines.slice(0, -1);
  const markedLine = lines.at(-1);

  return (
    <h1>
      {normalLines.map((line, index) => (
        <Fragment key={`${line}-${index}`}>
          {line}
          <br />
        </Fragment>
      ))}
      {markedLine ? <mark>{markedLine}</mark> : null}
    </h1>
  );
}

function Header() {
  return (
    <header className="newspaper-masthead">
      <div className="masthead-top">
        <a className="publication-name" href="#">
          AX Work Observatory
        </a>
        <div className="issue-label">
          <span>Issue</span>
          <strong>01</strong>
        </div>
      </div>
      <div className="masthead-rule">
        <span>일과 과정을 관측 가능한 시스템으로</span>
        <p>An independent publication on agentic work, human context, and organizational intelligence</p>
      </div>
    </header>
  );
}

function NewsWire({ activeTrack }: { activeTrack: ResearchTrack }) {
  const wireItems = [
    activeTrack.title,
    ...activeTrack.input,
    ...activeTrack.process,
    ...activeTrack.artifact,
    ...activeTrack.feedback,
  ];

  return (
    <div className="newswire" aria-label="Live issue wire">
      <span>Live Wire</span>
      <div className="newswire-window">
        <div className="newswire-track">
          {[...wireItems, ...wireItems].map((item, index) => (
            <b key={`${item}-${index}`}>{item}</b>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResearchPhoto({
  activeTrack,
  isPrinting,
  onOpenDetails,
}: {
  activeTrack: ResearchTrack;
  isPrinting: boolean;
  onOpenDetails: () => void;
}) {
  return (
    <figure
      className="research-photo"
      aria-label={`${activeTrack.title} dispatch image concept: ${activeTrack.machine.thesis}`}
      role="button"
      tabIndex={0}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      style={
        {
          "--workflow-accent": activeTrack.accent,
        } as CSSProperties
      }
    >
      <motion.div
        className="photo-develop"
        animate={isPrinting ? { opacity: [0.4, 0.78, 0.48] } : { opacity: 0.5 }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          className="dispatch-photo-stage"
          data-variant={activeTrack.machine.variant}
          key={activeTrack.id}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.36 }}
        >
          <DispatchFlowIllustration activeTrack={activeTrack} isPrinting={isPrinting} />
        </motion.div>
      </AnimatePresence>
      <p className="sr-only">
        {activeTrack.title}: {activeTrack.machine.thesis}
      </p>
    </figure>
  );
}

function DispatchFlowIllustration({
  activeTrack,
  isPrinting,
}: {
  activeTrack: ResearchTrack;
  isPrinting: boolean;
}) {
  const film = dispatchFilms[activeTrack.id];

  if (film) {
    return <PipelineFilm activeTrack={activeTrack} film={film} isPrinting={isPrinting} />;
  }

  const tempo = activeTrack.machine.tempo;
  const gatePart = activeTrack.machine.parts.find((part) => part.id === "gate");
  const columns = [
    {
      id: "signals",
      code: "IN",
      title: "Signals",
      items: activeTrack.input,
    },
    {
      id: "work",
      code: "RUN",
      title: "Work Steps",
      items: activeTrack.process,
    },
    {
      id: "proof",
      code: "OUT",
      title: "Artifacts",
      items: activeTrack.artifact,
    },
  ];

  return (
    <div className="flow-illustration">
      <motion.div
        className="flow-board"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flow-board-head">
          <span>{activeTrack.lane}</span>
          <strong>{activeTrack.machine.headline}</strong>
        </div>

        <div className="flow-stage-grid">
          {columns.map((column, columnIndex) => (
            <FlowColumn
              key={column.id}
              code={column.code}
              title={column.title}
              items={column.items}
              columnIndex={columnIndex}
              isPrinting={isPrinting}
              tempo={tempo}
            />
          ))}
        </div>

        <div className="flow-motion-track" aria-hidden="true">
          <motion.span
            className="flow-motion-fill"
            initial={false}
            animate={isPrinting ? { scaleX: [0.04, 0.55, 1, 1] } : { scaleX: 1 }}
            transition={{ duration: 4.9 / tempo, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="flow-motion-token"
            initial={false}
            animate={
              isPrinting
                ? { left: ["5%", "48%", "93%"], opacity: [0, 1, 1, 0] }
                : { left: "93%", opacity: 0.62 }
            }
            transition={{ duration: 4.9 / tempo, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          className="flow-gate"
          initial={false}
          animate={
            isPrinting
              ? { opacity: [0.72, 1, 0.76], y: [0, -2, 0] }
              : { opacity: 0.8, y: 0 }
          }
          transition={{ duration: 2.6 / tempo, repeat: Infinity, ease: "easeInOut" }}
        >
          <b>{gatePart?.code ?? "OK"}</b>
          <span>{gatePart?.mappedTo ?? "Approval Gate"}</span>
        </motion.div>

        <div className="flow-feedback-band">
          <span>Return Loop</span>
          <div>
            {activeTrack.feedback.map((item, index) => (
              <motion.b
                key={item}
                initial={false}
                animate={isPrinting ? { opacity: [0.48, 1, 0.58] } : { opacity: 0.7 }}
                transition={{
                  duration: 2.8 / tempo,
                  delay: index * 0.18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {item}
              </motion.b>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PipelineFilm({
  activeTrack,
  film,
  isPrinting,
}: {
  activeTrack: ResearchTrack;
  film: (typeof dispatchFilms)[string];
  isPrinting: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isPrinting) {
      void video.play().catch(() => undefined);
      return;
    }

    video.pause();
  }, [isPrinting]);

  return (
    <div className="flow-illustration pipeline-film-illustration">
      <div className="pipeline-film-frame">
        <video
          ref={videoRef}
          className="pipeline-film-video"
          src={film.src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label={`${activeTrack.title} pipeline film`}
        />
      </div>
    </div>
  );
}

function FlowColumn({
  code,
  title,
  items,
  columnIndex,
  isPrinting,
  tempo,
}: {
  code: string;
  title: string;
  items: string[];
  columnIndex: number;
  isPrinting: boolean;
  tempo: number;
}) {
  return (
    <motion.section
      className="flow-column"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: columnIndex * 0.06 }}
    >
      <header>
        <b>{code}</b>
        <span>{title}</span>
      </header>
      <ul>
        {items.map((item, itemIndex) => (
          <motion.li
            key={item}
            initial={false}
            animate={
              isPrinting
                ? {
                    opacity: [0.66, 1, 0.78],
                    x: [0, 1.5, 0],
                  }
                : { opacity: 0.78, x: 0 }
            }
            transition={{
              duration: 3.2 / tempo,
              delay: columnIndex * 0.42 + itemIndex * 0.14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

function MachineDetailOverlay({
  activeTrack,
  isPrinting,
  onClose,
}: {
  activeTrack: ResearchTrack;
  isPrinting: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="machine-detail-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.section
        className="machine-detail"
        aria-label={`${activeTrack.title} machine mapping`}
        style={
          {
            "--workflow-accent": activeTrack.accent,
          } as CSSProperties
        }
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="machine-detail-close" type="button" onClick={onClose} aria-label="Close detail view">
          <X size={17} />
        </button>
        <div className="machine-detail-stage">
          <div className="detail-note-head">
            <span>Frame Notes</span>
            <b>{activeTrack.status}</b>
          </div>
          <h2>{activeTrack.title}</h2>
          <p>{activeTrack.question}</p>
          <DetailWorkflowBoard activeTrack={activeTrack} isPrinting={isPrinting} />
        </div>
        <div className="machine-detail-copy">
          <span>{activeTrack.lane} System</span>
          <h2>{activeTrack.machine.headline}</h2>
          <p>{activeTrack.machine.thesis}</p>
          <div className="machine-detail-grid" aria-label="Detailed workflow mapping">
            {activeTrack.machine.parts.map((part) => (
              <article key={part.id}>
                <b>{part.code}</b>
                <strong>{part.label}</strong>
                <em>{part.mappedTo}</em>
                <p>{part.role}</p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function DetailWorkflowBoard({
  activeTrack,
  isPrinting,
}: {
  activeTrack: ResearchTrack;
  isPrinting: boolean;
}) {
  const stages = [
    { key: "input", label: "Signals", items: activeTrack.input },
    { key: "process", label: "Work Steps", items: activeTrack.process },
    { key: "artifact", label: "Artifacts", items: activeTrack.artifact },
    { key: "feedback", label: "Return Loop", items: activeTrack.feedback },
  ];

  return (
    <div className="detail-workflow-board">
      <div className="detail-flow-rail" aria-hidden="true">
        <motion.i
          initial={false}
          animate={isPrinting ? { scaleX: [0.08, 0.44, 0.78, 1] } : { scaleX: 1 }}
          transition={{ duration: 5.2 / activeTrack.machine.tempo, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.b
          initial={false}
          animate={
            isPrinting
              ? { left: ["3%", "34%", "66%", "95%"], opacity: [0, 1, 1, 0] }
              : { left: "95%", opacity: 0.65 }
          }
          transition={{ duration: 5.2 / activeTrack.machine.tempo, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {stages.map((stage, stageIndex) => (
        <motion.article
          className="detail-flow-card"
          key={stage.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: stageIndex * 0.06 }}
        >
          <header>
            <span>{String(stageIndex + 1).padStart(2, "0")}</span>
            <strong>{stage.label}</strong>
          </header>
          <ul>
            {stage.items.map((item, itemIndex) => (
              <motion.li
                key={item}
                initial={false}
                animate={isPrinting ? { opacity: [0.64, 1, 0.78] } : { opacity: 0.78 }}
                transition={{
                  duration: 3 / activeTrack.machine.tempo,
                  delay: stageIndex * 0.24 + itemIndex * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.article>
      ))}
    </div>
  );
}
