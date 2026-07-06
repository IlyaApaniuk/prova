"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { Fragment, useRef, useState } from "react";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { Lamp } from "./lamp";
import "./landing.css";

const CHAPTERS = [1, 2, 3, 4, 5] as const;

const MARQUEE_ITEMS = [
  "Revit",
  "SketchUp",
  "3ds Max",
  "Corona",
  "ArchiCAD",
  "Enscape",
  "AutoCAD",
  "V-Ray",
  "Interior designer",
  "3D visualizer",
  "Architect",
];

function MarqueeTrack() {
  return (
    <span>
      {MARQUEE_ITEMS.map((item) => (
        <Fragment key={item}>
          {item} <i>·</i>
        </Fragment>
      ))}
    </span>
  );
}

export function LightsLanding() {
  const t = useTranslations("Landing");
  const reduce = useReducedMotion();
  const spineRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [lit, setLit] = useState(false);

  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: ["start start", "end end"],
  });

  // Sketch is fully drawn by mid-chapter-1 — strokes appear immediately
  // as the spine enters, not after the reader has settled into the text.
  const drawScrub = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const drawStatic = useTransform(scrollYProgress, () => 1);
  const bg = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.62, 0.74, 0.84],
    ["#201B17", "#201B17", "#241E19", "#2C2521", "#3A3128", "#E7E1D6"],
  );

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // The switch clicks exactly as chapter 5 ("Offer") enters.
    setLit(v > 0.79);
    // Chapter is derived from continuous scroll progress (1/5 per chapter);
    // 0 = hero state. Robust against fast scrolling, unlike viewport events.
    setChapter(v <= 0 ? 0 : Math.min(5, Math.max(1, Math.ceil(v * 5))));
  });

  // Natural wrapping across locales (Russian words are long) — no hard breaks;
  // the accent words simply continue the stagger.
  const heroWords = [
    ...t("heroTitle")
      .split(" ")
      .map((word) => ({ word, accent: false })),
    ...t("heroAccent")
      .split(" ")
      .map((word) => ({ word, accent: true })),
  ];
  const year = new Date().getFullYear();

  const rich = {
    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
    em: (chunks: React.ReactNode) => <em>{chunks}</em>,
  };

  const demoSteps = [
    {
      n: "1",
      now: true,
      title: t("d1Title"),
      sub: t("d1Sub"),
      time: t("d1Time"),
    },
    {
      n: "2",
      now: false,
      title: t("d2Title"),
      sub: t("d2Sub"),
      time: t("d2Time"),
    },
    {
      n: "3",
      now: false,
      title: t("d3Title"),
      sub: t("d3Sub"),
      time: t("d3Time"),
    },
    {
      n: "4",
      now: false,
      title: t("d4Title"),
      sub: t("d4Sub"),
      time: t("d4Time"),
    },
  ];

  return (
    <div className="lights-landing" data-lit={lit} id="top">
      <motion.div
        className="ll-bg"
        style={{ backgroundColor: bg }}
        aria-hidden
      />
      <div className="ll-grain" aria-hidden />
      <div className="ll-flash" aria-hidden />

      <header className="ll-topbar">
        <a className="ll-wordmark" href="#top">
          <span className="tick" />
          prova
        </a>
        <div className="tag">
          <span>{t("protoTag")}</span>
          <LocaleSwitcher />
        </div>
      </header>

      {/* hero */}
      <section className="ll-hero">
        <h1>
          {heroWords.map(({ word, accent }, i) => (
            <Fragment key={`${word}-${i}`}>
              {i > 0 ? " " : null}
              <span
                className={accent ? "w accent" : "w"}
                style={{ animationDelay: `${0.05 + i * 0.1}s` }}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </h1>
        <p className="sub">{t.rich("heroSub", rich)}</p>
        <div className="ll-scroll-hint">
          <span className="cord" />
          {t("scrollHint")}
        </div>
      </section>

      {/* scrollytelling spine */}
      <div className="ll-spine" ref={spineRef}>
        <div className="ll-stage">
          <div className="lamp-wrap">
            <Lamp chapter={chapter} draw={reduce ? drawStatic : drawScrub} />
          </div>
        </div>

        <div className="ll-chapters">
          {CHAPTERS.map((n) => (
            <motion.section
              key={n}
              className="ll-chapter"
              onViewportEnter={() => setChapter(n)}
              viewport={{ amount: 0.55 }}
            >
              <motion.div
                className="box"
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.55, once: false }}
                transition={{ duration: 0.9, ease: [0.2, 0, 0.1, 1] }}
              >
                <p className="step">{t(`ch${n}Step` as "ch1Step")}</p>
                <h2>{t.rich(`ch${n}Title` as "ch1Title", rich)}</h2>
                <p className="body">
                  {t.rich(`ch${n}Body` as "ch1Body", rich)}
                </p>
              </motion.div>
            </motion.section>
          ))}
        </div>
      </div>

      {/* lit world */}
      <div className="ll-lit-world">
        <section className="ll-section">
          <div className="ll-section-head">
            <p className="ll-label">{t("demoLabel")}</p>
            <h2>{t("demoTitle")}</h2>
          </div>
          <div className="ll-demo">
            <article className="ll-card">
              <span className="ll-sample-tag">{t("sampleTag")}</span>
              <div className="studio">
                <div className="logo">N</div>
                <div>
                  <div className="sn">Studio Nordwind</div>
                  <div className="sm">{t("cardStudioMeta")}</div>
                </div>
              </div>
              <h3>{t("cardRole")}</h3>
              <div className="ll-chips">
                {[
                  t("chipFormat"),
                  t("chipEmployment"),
                  t("chipField"),
                  "SketchUp",
                  "3ds Max",
                ].map((chip) => (
                  <span key={chip} className="ll-chip">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="ll-salary">
                <span className="amt">€2,400 – 3,200</span>
                <span className="per">{t("salaryPer")}</span>
              </div>
              <div className="ll-steps">
                {demoSteps.map((step) => (
                  <div
                    key={step.n}
                    className={step.now ? "ll-step-row now" : "ll-step-row"}
                  >
                    <span className="n">{step.n}</span>
                    <span>
                      <span className="t">{step.title}</span>
                      <span className="s">{step.sub}</span>
                    </span>
                    <span className="time">{step.time}</span>
                  </div>
                ))}
              </div>
              <p className="ll-policy">{t("cardPolicy")}</p>
              <div className="cta-row">
                <a className="ll-btn" href="#waitlist">
                  {t("cardCta")}
                </a>
              </div>
            </article>
          </div>
        </section>

        <div className="ll-marquee" aria-hidden>
          <div className="track">
            <MarqueeTrack />
            <MarqueeTrack />
          </div>
        </div>

        <section className="ll-section ll-waitlist" id="waitlist">
          <div className="ll-lamp-seal" aria-hidden>
            <svg viewBox="0 0 64 84" fill="none">
              <defs>
                <radialGradient id="ll-seal-glow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#E9C98A" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#E9C98A" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse
                cx="32"
                cy="62"
                rx="22"
                ry="14"
                fill="url(#ll-seal-glow)"
              />
              <line
                x1="32"
                y1="2"
                x2="32"
                y2="24"
                stroke="#8C8578"
                strokeWidth="2"
              />
              <rect x="29" y="24" width="6" height="3" fill="#8A6F47" />
              <rect x="20" y="27" width="24" height="20" fill="#4A3B30" />
              <ellipse cx="32" cy="47" rx="12" ry="2.6" fill="#FFEFC4" />
            </svg>
          </div>
          <p className="ll-label">{t("wlLabel")}</p>
          <h2>{t.rich("wlTitle", rich)}</h2>
          <div className="form-slot">
            <WaitlistForm />
          </div>
          <p className="ll-studio-line">{t("wlStudioLine")}</p>
        </section>

        <footer className="ll-footer">
          <span className="fm">{t("footerTagline")}</span>
          <span className="fd">{t("footerRights", { year })}</span>
        </footer>
      </div>
    </div>
  );
}
