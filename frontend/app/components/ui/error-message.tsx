"use client";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div className={`w-full py-2 text-xs text-maroon sm:text-sm ${className}`}>
      {message}
    </div>
  );
}
