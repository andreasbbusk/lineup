"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Drum loading spinner component
 *
 * An animated drum with drumsticks on each side that hit the drum in a rhythmic pattern.
 * Perfect for a music-oriented social media platform.
 *
 * @example
 * <LoadingSpinner size={80} />
 */
export function LoadingSpinner({
  size = 80,
  className = "",
}: LoadingSpinnerProps) {
  // 3/4 perspective view dimensions
  const drumDiameter = size * 0.7; // Diameter of the drum
  const drumDepth = size * 0.4; // Depth of the drum shell (cylinder height) - significantly increased
  const stickLength = size * 0.65;
  const stickWidth = size * 0.05;
  const hitDistance = size * 0.06;
  const lugSize = size * 0.03;
  const rimThickness = size * 0.02;

  // Perspective transform values for 3/4 view - adjusted to match reference
  const perspective = 1200; // Increased for better depth perception
  const rotateX = -15; // Tilt back to show top (less tilt for more front-facing view)
  const rotateY = 20; // Rotation to show side (slightly less rotation)

  // Ellipse scale for top/bottom drumheads from 3/4 perspective
  const ellipseScaleY = 0.5; // Makes circles appear as ellipses from the angle

  // Animation configuration for drumsticks - realistic hitting motion
  const stickTransition = {
    duration: 0.5,
    repeat: Infinity,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  };

  const drumTransition = {
    duration: 0.5,
    repeat: Infinity,
    ease: "easeOut" as const,
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        perspective: `${perspective}px`,
      }}
      aria-label="Loading"
      role="status"
    >
      {/* Container for 3D perspective */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Left Drumstick - Coming from above-left */}
        <motion.div
          className="absolute origin-bottom"
          style={{
            width: stickWidth,
            height: stickLength,
            left: -size * 0.4,
            top: -size * 0.2,
            transformStyle: "preserve-3d",
          }}
          initial={{
            rotate: -60,
            rotateX: 20,
            rotateZ: -20,
          }}
          animate={{
            rotate: [-60, -15, -60],
            rotateX: [20, 5, 20],
            rotateZ: [-20, -5, -20],
            y: [0, hitDistance, 0],
          }}
          transition={stickTransition}
        >
          <div className="h-full w-full rounded-full bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 shadow-lg" />
        </motion.div>

        {/* Drum - Connected 3D Cylinder - Yellow-Orange Snare Drum */}
        <div
          className="relative z-10"
          style={{
            width: drumDiameter,
            height: drumDiameter * ellipseScaleY + drumDepth,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Top drumhead - Light beige, sits on top of shell - appears as ellipse from 3/4 view */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: drumDiameter,
              height: drumDiameter,
              background:
                "linear-gradient(to bottom, #fef9e7, #fef3c7, #fde68a)",
              boxShadow:
                "inset 0 2px 8px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.2)",
              transform: `translateZ(${
                drumDepth / 2
              }px) scaleY(${ellipseScaleY})`,
              transformStyle: "preserve-3d",
            }}
            animate={{
              scaleY: [ellipseScaleY, ellipseScaleY * 1.02, ellipseScaleY],
            }}
            transition={drumTransition}
          >
            {/* Dark gray rim on top */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `${rimThickness}px solid #4b5563`,
                background:
                  "linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.4)",
              }}
            />

            {/* Drum head center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full"
                style={{
                  width: drumDiameter * 0.3,
                  height: drumDiameter * 0.3,
                  background:
                    "radial-gradient(circle, rgba(0,0,0,0.08) 0%, transparent 70%)",
                }}
              />
            </div>

            {/* Hit effect rings - appear on each stick hit */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-yellow-300/50"
              style={{ zIndex: 10 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-yellow-200/40"
              style={{ zIndex: 10 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.25,
              }}
            />
          </motion.div>

          {/* 3D Cylinder Shell - Yellow-orange, connects top and bottom */}
          <div
            className="absolute"
            style={{
              width: drumDiameter,
              height: drumDepth,
              top: drumDiameter * ellipseScaleY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Front face of cylinder - warm yellow-orange */}
            <div
              className="absolute"
              style={{
                width: drumDiameter,
                height: drumDepth,
                background:
                  "linear-gradient(to bottom, #fb923c, #f97316, #ea580c)",
                boxShadow:
                  "inset 0 2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)",
                transform: `rotateY(0deg) translateZ(${drumDiameter / 2}px)`,
              }}
            >
              {/* Tension rods/lugs on front - dark gray */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    width: lugSize,
                    height: lugSize * 2.5,
                    left: (drumDiameter / 5) * (i + 1) - lugSize / 2,
                    top: drumDepth / 2 - lugSize * 1.25,
                    background:
                      "linear-gradient(to bottom, #4b5563, #374151, #1f2937)",
                    boxShadow:
                      "inset 0 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)",
                    borderRadius: "2px",
                  }}
                />
              ))}
            </div>

            {/* Back face of cylinder */}
            <div
              className="absolute"
              style={{
                width: drumDiameter,
                height: drumDepth,
                background:
                  "linear-gradient(to bottom, #f97316, #ea580c, #f97316)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                transform: `rotateY(180deg) translateZ(${drumDiameter / 2}px)`,
              }}
            />

            {/* Left side of cylinder (curved) */}
            <div
              className="absolute"
              style={{
                width: drumDepth,
                height: drumDepth,
                left: drumDiameter / 2 - drumDepth / 2,
                background: "linear-gradient(to right, #fb923c, #f97316)",
                boxShadow: "inset 2px 0 4px rgba(0,0,0,0.3)",
                borderRadius: "50%",
                transform: `rotateY(-90deg) translateZ(${drumDiameter / 2}px)`,
              }}
            />

            {/* Right side of cylinder (curved) */}
            <div
              className="absolute"
              style={{
                width: drumDepth,
                height: drumDepth,
                left: drumDiameter / 2 - drumDepth / 2,
                background: "linear-gradient(to left, #fb923c, #f97316)",
                boxShadow: "inset -2px 0 4px rgba(0,0,0,0.3)",
                borderRadius: "50%",
                transform: `rotateY(90deg) translateZ(${drumDiameter / 2}px)`,
              }}
            />
          </div>

          {/* Bottom drumhead - Light beige, sits on bottom of shell - appears as ellipse from 3/4 view */}
          <div
            className="absolute rounded-full"
            style={{
              width: drumDiameter,
              height: drumDiameter,
              top: drumDiameter * ellipseScaleY + drumDepth,
              background: "linear-gradient(to top, #fef9e7, #fef3c7, #fde68a)",
              boxShadow:
                "inset 0 -2px 8px rgba(0,0,0,0.1), 0 -4px 12px rgba(0,0,0,0.2)",
              transform: `translateZ(${
                -drumDepth / 2
              }px) scaleY(${ellipseScaleY})`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Dark gray rim on bottom */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `${rimThickness}px solid #4b5563`,
                background:
                  "linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)",
                boxShadow:
                  "inset 0 -2px 4px rgba(0,0,0,0.3), 0 -2px 6px rgba(0,0,0,0.4)",
              }}
            />
          </div>

          {/* Drum shadow beneath - elliptical to match perspective */}
          <div
            className="absolute rounded-full"
            style={{
              width: drumDiameter * 0.9,
              height: drumDiameter * 0.2,
              top:
                drumDiameter * ellipseScaleY + drumDepth + drumDiameter * 0.1,
              left: (drumDiameter - drumDiameter * 0.9) / 2,
              background:
                "radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)",
              filter: "blur(6px)",
              transform: `translateZ(${-drumDepth * 1.2}px) scaleY(${
                ellipseScaleY * 0.8
              })`,
            }}
          />
        </div>

        {/* Right Drumstick - Coming from above-right */}
        <motion.div
          className="absolute origin-bottom"
          style={{
            width: stickWidth,
            height: stickLength,
            right: -size * 0.4,
            top: -size * 0.2,
            transformStyle: "preserve-3d",
          }}
          initial={{
            rotate: 60,
            rotateX: 20,
            rotateZ: 20,
          }}
          animate={{
            rotate: [60, 15, 60],
            rotateX: [20, 5, 20],
            rotateZ: [20, 5, 20],
            y: [0, hitDistance, 0],
          }}
          transition={{
            ...stickTransition,
            delay: 0.25, // Offset so sticks hit at different times (creates rhythm)
          }}
        >
          <div className="h-full w-full rounded-full bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 shadow-lg" />
        </motion.div>
      </div>
    </div>
  );
}
