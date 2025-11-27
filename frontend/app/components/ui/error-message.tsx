"use client";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div className={`w-full text-xs text-maroon sm:text-sm ${className}`}>
      {message}
    </div>
  );
}
