"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play, X } from "lucide-react";
import { flowNodes, researchTracks } from "@/content/research";
import { ResearchMachineScene } from "@/components/research-machine-scene";
import type { ResearchTrack } from "@/content/research";

const issueCards = [
  {
    title: "관측의 시작점",
    page: "p. 16",
    copy: "개발 워크플로를 브라우저 안에서 관측하고 기록하는 환경",
  },
  {
    title: "기억과 대화의 로그",
    page: "p. 24",
    copy: "대화의 의도와 결정 흐름을 다음 실행의 자산으로 남기는 방식",
  },
  {
    title: "콘텐츠로의 변환",
    page: "p. 32",
    copy: "데이터와 신호를 발행 가능한 지식으로 전환하는 워크플로",
  },
];

const dispatchPages = ["16", "24", "32", "40"];

export function ObservatoryHome() {
  const [activeId, setActiveId] = useState(researchTracks[0].id);
  const [isPrinting, setIsPrinting] = useState(true);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMotionActive = isPrinting && !prefersReducedMotion;
  const activeTrack =
    researchTracks.find((track) => track.id === activeId) ?? researchTracks[0];
  const expandedTrack = expandedTrackId
    ? researchTracks.find((track) => track.id === expandedTrackId)
    : null;

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
          <motion.section
            className="cover-column"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
          >
            <span className="rubric">Cover Story</span>
            <h1>
              AX 시대,
              <br />
              일의 과정은
              <br />
              어떻게
              <br />
              <mark>관측되는가</mark>
            </h1>
            <p>
              워크플로우의 맥락을 수집하고, 의미 있는 콘텐츠로 변환하며, 실행
              가능한 인사이트로 연결하는 에이전틱 워크 엔진의 실험과 기록.
            </p>
            <a className="read-link" href="#research-dispatch">
              Read the Dispatch
            </a>
            <strong className="folio">p. 08</strong>
          </motion.section>

          <section className="main-story">
            <ResearchPhoto
              key={activeTrack.id}
              activeTrack={activeTrack}
              isPrinting={isMotionActive}
              onOpenDetails={() => setExpandedTrackId(activeTrack.id)}
            />
            <div className="issue-copy">
              <span>In This Issue</span>
              <p>
                AX 워크는 기술이 일을 대체하는 것이 아니라, 일의 맥락을 이해하고
                확장하는 방식으로 진화하고 있습니다. 이번 호에서는 에이전틱 워크
                엔진을 구성하는 네 가지 핵심 흐름과 실제 조직에서의 적용 실험을
                기록합니다.
              </p>
            </div>
            <div className="issue-card-grid" id="notes">
              {issueCards.map((card) => (
                <article key={card.title}>
                  <h2>{card.title}</h2>
                  <p>{card.copy}</p>
                  <strong>{card.page}</strong>
                </article>
              ))}
            </div>
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
                  onClick={() => setActiveId(track.id)}
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
                    <em>p. {dispatchPages[index] ?? String(16 + index * 8)}</em>
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
          <button className="photo-frame-note" type="button" onClick={onOpenDetails}>
            Frame Notes
          </button>
        </motion.div>
      </AnimatePresence>
      <p className="sr-only">
        {activeTrack.title}: {activeTrack.machine.thesis}
      </p>
      <figcaption>
        <span>Current Focus</span>
        <AnimatePresence mode="wait">
          <motion.strong
            key={activeTrack.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.24 }}
          >
            {activeTrack.title}
          </motion.strong>
        </AnimatePresence>
      </figcaption>
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
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="machine-detail-close" type="button" onClick={onClose} aria-label="Close detail view">
          <X size={17} />
        </button>
        <div
          className="machine-detail-stage"
          style={
            {
              "--workflow-accent": activeTrack.accent,
            } as CSSProperties
          }
        >
          <ResearchMachineScene activeTrack={activeTrack} isPrinting={isPrinting} />
        </div>
        <div className="machine-detail-copy">
          <span>{activeTrack.lane} System</span>
          <h2>{activeTrack.machine.headline}</h2>
          <p>{activeTrack.machine.thesis}</p>
          <div className="machine-detail-grid">
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
