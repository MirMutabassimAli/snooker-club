"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";

const redBalls = [
  [580, 252], [598, 241], [598, 263], [616, 230], [616, 252], [616, 274], [634, 241], [634, 263]
];

export function MotionTable() {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 18, mass: 0.5 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 18, mass: 0.5 });
  const rotateZ = useTransform(smoothX, [-0.5, 0.5], [-1.8, 1.8]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [1.2, -1.2]);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <div
      className="motion-table-wrap"
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
      aria-hidden="true"
    >
      <motion.div
        className="table-rig"
        style={{ rotateZ, rotateX }}
        initial={{ opacity: 0, y: 42, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.15, delay: 0.25, ease: [0.22, 0.75, 0.24, 1] }}
      >
        <svg className="snooker-svg" viewBox="0 0 800 430" fill="none">
          <defs>
            <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#866147"/><stop offset=".35" stopColor="#4a2e20"/><stop offset=".72" stopColor="#271910"/><stop offset="1" stopColor="#65412c"/>
            </linearGradient>
            <radialGradient id="felt" cx="50%" cy="34%" r="72%">
              <stop stopColor="#13805a"/><stop offset=".55" stopColor="#0a6547"/><stop offset="1" stopColor="#06412d"/>
            </radialGradient>
            <radialGradient id="redBall" cx="32%" cy="25%" r="72%">
              <stop stopColor="#ffb1b4"/><stop offset=".15" stopColor="#ed5960"/><stop offset=".55" stopColor="#c52c34"/><stop offset="1" stopColor="#670e13"/>
            </radialGradient>
            <radialGradient id="whiteBall" cx="32%" cy="25%" r="72%">
              <stop stopColor="#fff"/><stop offset=".62" stopColor="#e9e9df"/><stop offset="1" stopColor="#a2a39d"/>
            </radialGradient>
            <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#9dffca" stopOpacity=".4"/><stop offset="1" stopColor="#9dffca" stopOpacity="0"/></linearGradient>
            <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#fff" stopOpacity="0"/><stop offset=".5" stopColor="#fff" stopOpacity=".45"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
            <filter id="tableShadow" x="-20%" y="-20%" width="140%" height="170%">
              <feDropShadow dx="0" dy="34" stdDeviation="25" floodColor="#000" floodOpacity=".75"/>
            </filter>
            <filter id="ballShadow" x="-100%" y="-100%" width="300%" height="300%">
              <feDropShadow dx="1" dy="3" stdDeviation="2.3" floodColor="#000" floodOpacity=".6"/>
            </filter>
            <clipPath id="feltClip"><rect x="82" y="87" width="636" height="270" rx="17"/></clipPath>
          </defs>

          <motion.g
            initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.36, 0.18] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}
          >
            <path d="M220 0h110l90 340H82L220 0Z" fill="url(#beam)" opacity=".12"/>
            <path d="M470 0h110l138 340H380L470 0Z" fill="#8fffc0" opacity=".035"/>
          </motion.g>

          <g filter="url(#tableShadow)">
            <path d="M58 65h684l38 310H20L58 65Z" fill="url(#wood)" stroke="#a07252" strokeOpacity=".55" strokeWidth="2"/>
            <path d="M72 77h656l27 292H45L72 77Z" fill="#17251d"/>
            <rect x="82" y="87" width="636" height="270" rx="17" fill="url(#felt)"/>
            <rect x="82" y="87" width="636" height="270" rx="17" stroke="#050907" strokeOpacity=".8" strokeWidth="6"/>
            <g clipPath="url(#feltClip)">
              <path d="M238 86v272" stroke="#e3f4e8" strokeOpacity=".35"/>
              <path d="M238 165a80 80 0 0 0 0 115" stroke="#e3f4e8" strokeOpacity=".35"/>
              <motion.path
                d="M-20 90h900v270H-20z" fill="url(#sweep)" opacity=".12"
                animate={reducedMotion ? undefined : { x: [-420, 420] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
            {[[81,87],[400,84],[719,87],[81,357],[400,360],[719,357]].map(([cx,cy], index)=>(
              <circle key={index} cx={cx} cy={cy} r="14" fill="#020403" stroke="#19221d" strokeWidth="5"/>
            ))}
            <path d="M52 375h706l-33 32H84L52 375Z" fill="#1b110c" opacity=".95"/>
          </g>

          <g filter="url(#ballShadow)">
            <circle cx="245" cy="191" r="9" fill="#e2c933"/>
            <circle cx="245" cy="251" r="9" fill="#2d9e59"/>
            <circle cx="245" cy="220" r="9" fill="#9b653a"/>
            <circle cx="399" cy="222" r="9" fill="#2f85c0"/>
            <circle cx="535" cy="222" r="9" fill="#d887a0"/>
            <circle cx="681" cy="222" r="9" fill="#111"/>
            {redBalls.map(([cx,cy], index)=><circle key={index} cx={cx} cy={cy} r="9" fill="url(#redBall)"/>) }
            <motion.circle
              cx="216" cy="230" r="9" fill="url(#whiteBall)"
              animate={reducedMotion ? undefined : { cx: [216, 338, 295, 216], cy: [230, 214, 223, 230], rotate: [0, 220, 390, 520] }}
              transition={{ duration: 8.5, times: [0, .73, .84, 1], repeat: Infinity, ease: [0.22, 0.75, 0.24, 1] }}
            />
          </g>
          <motion.line
            x1="-20" y1="237" x2="208" y2="230" stroke="#d5ac78" strokeWidth="5" strokeLinecap="round"
            animate={reducedMotion ? undefined : { x1: [-20, 25, -35, -20], x2: [208, 253, 193, 208] }}
            transition={{ duration: 8.5, times: [0, .68, .73, 1], repeat: Infinity, ease: [0.22, 0.75, 0.24, 1] }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
