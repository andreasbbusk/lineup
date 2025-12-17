"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/app/modules/hooks/useReducedMotion";
import { ReactNode } from "react";

const variants = {
  normal: {
    initial: { opacity: 0 },
    animate: { opacity: 1},
    exit: { opacity: 0 },
  },
  reduced: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
  },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const pageVariants = prefersReducedMotion
    ? variants.reduced
    : variants.normal;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
