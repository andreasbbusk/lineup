"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: number;
  variant?: "rays" | "dots" | "ring";
}

export function LoadingSpinner({
  size = 36,
  variant = "rays",
}: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-inherit">
      {variant === "dots" && <DotsSpinner size={size} />}
      {variant === "ring" && <RingSpinner size={size} />}
      {variant === "rays" && <RaysSpinner size={size} />}
    </>
  );
}

// --- Variant 1: Rays (Default) ---
function RaysSpinner({ size }: { size: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    >
      <svg width={size} height={size} viewBox="0 0 50 50">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.g
            key={i}
            transform={`rotate(${i * 30} 25 25)`}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 0.08,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.005,
            }}
          >
            <line
              x1="25"
              y1="6"
              x2="25"
              y2="14"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-crocus-yellow"
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

// --- Variant 2: Dots ---
function DotsSpinner({ size }: { size: number }) {
  const dotSize = size / 8;

  return (
    <div
      className="flex items-center justify-center gap-2"
      aria-label="Loading"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full bg-crocus-yellow"
          style={{ width: dotSize, height: dotSize }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// --- Variant 3: Ring ---
function RingSpinner({ size }: { size: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    >
      <motion.div
        className="absolute rounded-full border-4 border-crocus-yellow/20"
        style={{ width: size, height: size }}
      />
      <motion.div
        className="absolute rounded-full border-4 border-crocus-yellow border-t-transparent"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
