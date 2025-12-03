"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

export function LoadingSpinner({
  size = 120, // Increased default size
  className = "",
}: LoadingSpinnerProps) {
  // Ripple spinner variables (commented out)
  // const rippleCount = 3;
  // const rippleSize = size * 0.8; // Larger base size
  // const maxScale = 4; // More expansion for bigger effect

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
      }}
      aria-label="Loading"
      role="status"
    >
      {/* RIPPLE SPINNER - Commented out for easy switching */}
      {/* "Loading..." text with letters jumping once in sequence */}
      {/* <div className="absolute z-10 flex items-center text-xl font-medium text-crocus-yellow">
        {"Loading...".split("").map((letter, index) => {
          const totalLetters = "Loading...".length;
          const jumpDuration = 0.3;
          const delayBetweenLetters = 0.15;
          const totalCycleDuration =
            totalLetters * delayBetweenLetters + jumpDuration;

          return (
            <motion.span
              key={index}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: jumpDuration,
                repeat: Infinity,
                repeatDelay: totalCycleDuration - jumpDuration,
                ease: "easeOut",
                delay: index * delayBetweenLetters,
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          );
        })}
      </div> */}

      {/* SVG SPINNER - Like Motion.dev example but in crocus yellow */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className="absolute"
        style={{
          width: size,
          height: size,
        }}
      >
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = index * 30; // 12 segments, 30 degrees each
          const rotation = angle;
          const delay = index * 0.1;

          return (
            <motion.g
              key={index}
              transform={`rotate(${rotation} 25 25)`}
              initial={{ opacity: 0.2 }}
              animate={{
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay,
              }}
            >
              <line
                x1="25"
                y1="6"
                x2="25"
                y2="14"
                stroke="var(--color-crocus-yellow)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
