"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function ActionModal({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => event.currentTarget === event.target && onClose()}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="action-modal"
            initial={{ opacity: 0, y: 22, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 330, damping: 28 }}
          >
            <header className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={17}/></button></header>
            <div className="modal-body">{children}</div>
            <footer className="modal-foot">{footer}</footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
