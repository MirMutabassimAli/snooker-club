"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";

export function IntroOverlay({ visible }: { visible: boolean }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.025, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: [0.22, 0.75, 0.24, 1] }}
        >
          <motion.div
            initial={{ y: 54, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 0.75, 0.24, 1] }}
          >
            <BrandMark className="intro-brand" />
          </motion.div>
          <motion.i
            className="intro-rule"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 0.75, 0.24, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
