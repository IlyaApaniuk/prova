"use client";

import { motion, type MotionValue } from "framer-motion";

type LampProps = {
  chapter: number;
  /** 0→1 sketch draw-on progress, scrubbed by scroll */
  draw: MotionValue<number>;
};

/**
 * The brand lamp maturing through design stages:
 * sketch → blueprint → clay → materials → lit.
 * Stage visibility is CSS-driven via data-ch on the wrapper.
 */
export function Lamp({ chapter, draw }: LampProps) {
  return (
    <div className="lamp" data-ch={chapter} aria-hidden>
      <svg viewBox="0 0 420 640" fill="none">
        <defs>
          <filter id="ll-wobble">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves="2"
              seed="7"
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
          </filter>
          <linearGradient id="ll-clay" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7A6E5F" />
            <stop offset="1" stopColor="#4A4238" />
          </linearGradient>
          <linearGradient id="ll-brass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9C7E52" />
            <stop offset=".5" stopColor="#6E5636" />
            <stop offset="1" stopColor="#8A6F47" />
          </linearGradient>
          <linearGradient id="ll-linen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D9CDB6" />
            <stop offset=".5" stopColor="#EFE4CC" />
            <stop offset="1" stopColor="#C9BCA4" />
          </linearGradient>
          <linearGradient id="ll-lit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F0DCB2" />
            <stop offset=".5" stopColor="#FBEFCF" />
            <stop offset="1" stopColor="#EBD3A2" />
          </linearGradient>
          <radialGradient id="ll-halo" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="rgba(245,220,164,.55)" />
            <stop offset=".55" stopColor="rgba(233,201,138,.18)" />
            <stop offset="1" stopColor="rgba(233,201,138,0)" />
          </radialGradient>
          <linearGradient id="ll-cone" x1=".5" y1="0" x2=".5" y2="1">
            <stop offset="0" stopColor="rgba(245,220,164,.32)" />
            <stop offset="1" stopColor="rgba(245,220,164,0)" />
          </linearGradient>
        </defs>

        {/* 1 · sketch — hand-drawn wobble, draw-on scrubbed by scroll */}
        <g
          className="g g-sketch"
          filter="url(#ll-wobble)"
          stroke="#B7AE9F"
          strokeWidth="1.6"
        >
          <motion.line
            x1="210"
            y1="0"
            x2="210"
            y2="150"
            style={{ pathLength: draw }}
          />
          <motion.circle
            cx="210"
            cy="184"
            r="34"
            style={{ pathLength: draw }}
          />
          <motion.line
            x1="210"
            y1="218"
            x2="210"
            y2="252"
            style={{ pathLength: draw }}
          />
          <motion.ellipse
            cx="210"
            cy="262"
            rx="62"
            ry="10"
            style={{ pathLength: draw }}
          />
          <motion.line
            x1="148"
            y1="262"
            x2="148"
            y2="418"
            style={{ pathLength: draw }}
          />
          <motion.line
            x1="272"
            y1="262"
            x2="272"
            y2="418"
            style={{ pathLength: draw }}
          />
          <motion.ellipse
            cx="210"
            cy="418"
            rx="62"
            ry="10"
            style={{ pathLength: draw }}
          />
        </g>

        {/* 2 · blueprint — hairlines + dimension callouts */}
        <g className="g g-blueprint" stroke="#C8A96A" strokeWidth="1">
          <line x1="210" y1="0" x2="210" y2="150" />
          <circle cx="210" cy="184" r="34" />
          <line x1="210" y1="218" x2="210" y2="252" />
          <rect x="148" y="262" width="124" height="156" />
          <ellipse cx="210" cy="262" rx="62" ry="10" />
          <ellipse cx="210" cy="418" rx="62" ry="10" />
          <line
            x1="210"
            y1="240"
            x2="210"
            y2="440"
            strokeDasharray="4 6"
            strokeOpacity=".5"
          />
          <line x1="148" y1="452" x2="272" y2="452" />
          <line x1="148" y1="446" x2="148" y2="458" />
          <line x1="272" y1="446" x2="272" y2="458" />
          <line x1="300" y1="262" x2="300" y2="418" />
          <line x1="294" y1="262" x2="306" y2="262" />
          <line x1="294" y1="418" x2="306" y2="418" />
        </g>
        <g className="g g-bp-labels">
          <text className="dim-label" x="186" y="474">
            Ø 320
          </text>
          <text className="dim-label" x="312" y="345">
            h 480
          </text>
          <text className="dim-label" x="246" y="196">
            2700 K
          </text>
        </g>

        {/* 3 · clay */}
        <g className="g g-clay">
          <rect x="207" y="0" width="6" height="150" fill="url(#ll-clay)" />
          <circle
            cx="210"
            cy="184"
            r="34"
            stroke="url(#ll-clay)"
            strokeWidth="11"
            fill="none"
          />
          <rect x="206" y="216" width="8" height="38" fill="url(#ll-clay)" />
          <rect
            x="148"
            y="258"
            width="124"
            height="164"
            rx="3"
            fill="url(#ll-clay)"
          />
          <ellipse cx="210" cy="258" rx="62" ry="10" fill="#857868" />
        </g>

        {/* 4 · materials — brass, walnut, linen */}
        <g className="g g-material">
          <rect x="207.5" y="0" width="5" height="150" fill="#3A322A" />
          <circle
            cx="210"
            cy="184"
            r="34"
            stroke="#4A3B30"
            strokeWidth="10"
            fill="none"
          />
          <rect x="206" y="216" width="8" height="38" fill="#3A322A" />
          <ellipse cx="210" cy="260" rx="63" ry="11" fill="url(#ll-brass)" />
          <rect
            x="148"
            y="260"
            width="124"
            height="160"
            fill="url(#ll-linen)"
          />
          <g stroke="#B4A78D" strokeWidth="1" strokeOpacity=".35">
            <line x1="168" y1="262" x2="168" y2="418" />
            <line x1="189" y1="262" x2="189" y2="418" />
            <line x1="210" y1="262" x2="210" y2="418" />
            <line x1="231" y1="262" x2="231" y2="418" />
            <line x1="252" y1="262" x2="252" y2="418" />
          </g>
          <ellipse cx="210" cy="420" rx="62" ry="10" fill="#CBBEA4" />
        </g>

        {/* 5 · lit */}
        <g className="g g-glow">
          <circle cx="210" cy="360" r="230" fill="url(#ll-halo)" />
          <rect x="148" y="260" width="124" height="160" fill="url(#ll-lit)" />
          <ellipse cx="210" cy="420" rx="62" ry="10" fill="#FFEFC4" />
          <polygon
            points="148,424 272,424 330,640 90,640"
            fill="url(#ll-cone)"
          />
        </g>
      </svg>
    </div>
  );
}
