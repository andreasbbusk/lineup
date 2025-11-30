"use client";

import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { Button } from "@/app/components/ui/buttons";

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

const SWIPE_THRESHOLD = 50; // Minimum pixels to trigger swipe

export function OnboardingConceptSlider() {
  const { nextStep } = useOnboardingNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Touch/swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null; // Reset end position
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    // If user just tapped (no move), ignore
    if (touchStartX.current === null || touchEndX.current === null) {
      touchStartX.current = null;
      return;
    }

    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        goToNext(); // Swiped left, go to next
      } else {
        goToPrev(); // Swiped right, go to previous
      }
    }

    // Reset refs
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-4">
      {/* Carousel */}
      <div className="mb-8 flex w-full max-w-md items-center justify-center gap-4 sm:mb-12 sm:gap-8">
        {/* Left Arrow */}
        <button
          onClick={goToPrev}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black transition-all hover:bg-gray-50 active:scale-90 sm:h-10 sm:w-10"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>

        {/* Slides Container */}
        <div
          className="relative h-[220px] w-full max-w-[240px] touch-pan-y overflow-hidden sm:h-[260px] sm:max-w-[280px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {SLIDES.map((slide, index) => (
              <div
                key={index}
                className="flex min-w-full flex-col items-center gap-2"
              >
                <div className="relative mb-2 flex h-[160px] w-full items-center justify-center sm:h-[200px]">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="pointer-events-none object-contain"
                    priority={index === 0}
                    draggable={false}
                  />
                </div>
                <h2 className="whitespace-pre-wrap text-center text-lg font-bold text-black sm:text-xl">
                  {slide.title}
                </h2>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={goToNext}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black transition-all hover:bg-gray-50 active:scale-90 sm:h-10 sm:w-10"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="mb-6 flex gap-2 sm:mb-8">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 active:scale-90 ${
              index === currentSlide ? "w-4 bg-black" : "w-1.5 bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? "true" : "false"}
          />
        ))}
      </div>

      {/* Get Started Button */}
      <div className="mt-8">
        <Button type="button" variant="primary" onClick={nextStep}>
          Get started!
        </Button>
      </div>
    </div>
  );
}