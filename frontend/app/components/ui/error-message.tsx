"use client";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div role="alert" aria-live="assertive" className={`w-full py-1 text-xs text-maroon sm:text-sm ${className}`}>
      {message}
    </div>
  );
}
