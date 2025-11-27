"use client";

import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    image: "/images/onboarding2.webp",
    title: "Make connections with\nmusicians",
  },
  {
    image: "/images/onboarding1.webp",
    title: "Post requests",
  },
  {
    image: "/images/onboarding3.webp",
    title: "Find the right service for you",
  },
];

export function OnboardingConceptSlider() {
  const { nextStep } = useOnboardingNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [showNewSlide, setShowNewSlide] = useState(true); // Start true to show first slide
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleSlideChange = (newIndex: number) => {
    if (newIndex === currentSlide) return;

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    const newDirection = newIndex > currentSlide ? "right" : "left";
    setDirection(newDirection);
    setPrevSlide(currentSlide);
    setIsTransitioning(true);
    setShowNewSlide(false);
    setCurrentSlide(newIndex);

    // Show new slide with initial position, then trigger transition
    requestAnimationFrame(() => {
      setShowNewSlide(true);
    });

    // Clean up after animation
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setShowNewSlide(false);
      transitionTimeoutRef.current = null;
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const goToNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      handleSlideChange(currentSlide + 1);
    }
  };

  const goToPrev = () => {
    if (currentSlide > 0) {
      handleSlideChange(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-4">
      {/* Carousel container */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-12 w-full max-w-md">
        {/* Left arrow */}
        <button
          onClick={goToPrev}
          disabled={currentSlide === 0}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-black disabled:opacity-30 shrink-0 transition-opacity"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        {/* Slide content with transition */}
        <div className="relative w-full max-w-[240px] sm:max-w-[280px] h-[220px] sm:h-[260px] overflow-hidden">
          {/* Previous slide - sliding out */}
          {isTransitioning && (
            <div
              className={`absolute inset-0 flex flex-col items-center gap-2 transition-transform duration-500 ease-in-out ${
                direction === "right" ? "-translate-x-full" : "translate-x-full"
              }`}
            >
              <div className="relative h-[160px] sm:h-[200px] w-full flex items-center justify-center mb-2">
                <Image
                  src={SLIDES[prevSlide].image}
                  alt={SLIDES[prevSlide].title}
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-black text-center whitespace-pre-wrap">
                {SLIDES[prevSlide].title}
              </h2>
            </div>
          )}

          {/* Current slide - sliding in */}
          <div
            className={`absolute inset-0 flex flex-col items-center gap-2 ${
              isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
            } ${
              !isTransitioning
                ? "translate-x-0"
                : showNewSlide
                ? "translate-x-0"
                : direction === "right"
                ? "translate-x-full"
                : "-translate-x-full"
            }`}
          >
            <div className="relative h-[160px] sm:h-[200px] w-full flex items-center justify-center mb-2">
              <Image
                src={SLIDES[currentSlide].image}
                alt={SLIDES[currentSlide].title}
                fill
                className="object-contain"
                priority={currentSlide === 0}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-black text-center whitespace-pre-wrap">
              {SLIDES[currentSlide].title}
            </h2>
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={goToNext}
          disabled={currentSlide === SLIDES.length - 1}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-black disabled:opacity-30 shrink-0 transition-opacity"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Pagination dots */}
      <div className="flex gap-2 mb-6 sm:mb-8">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            disabled={isTransitioning}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? "w-4 bg-black" : "w-1.5 bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Get started button */}
      <button
        onClick={nextStep}
        className="bg-crocus-yellow px-5 py-2 rounded-full text-sm sm:text-base font-normal text-black hover:opacity-90 transition-opacity duration-200 mt-8"
      >
        Get started!
      </button>
    </div>
  );
}
