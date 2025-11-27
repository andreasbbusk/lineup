"use client";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div className={`w-full text-xs text-maroon sm:px-4 sm:py-3 sm:text-sm ${className}`}>
      {message}
    </div>
  );
}
