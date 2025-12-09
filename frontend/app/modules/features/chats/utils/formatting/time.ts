// Constants - Time units in milliseconds
const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_DAY = 86_400_000;

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_IN_WEEK = 7;

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Utility functions
const paddingWithZero = (num: number): string => String(num).padStart(2, "0");

const getEuropeanDateString = (date: Date, includeYear = false): string => {
  const day = paddingWithZero(date.getDate());
  const month = paddingWithZero(date.getMonth() + 1);

  if (includeYear) {
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  return `${day}/${month}`;
};

const areSameDay = (firstDate: Date, secondDate: Date): boolean => {
  return (
    firstDate.getDate() === secondDate.getDate() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getFullYear() === secondDate.getFullYear()
  );
};

const getClockTime = (date: Date): string => {
  const hours = paddingWithZero(date.getHours());
  const minutes = paddingWithZero(date.getMinutes());
  return `${hours}:${minutes}`;
};

// Returns relative time string (e.g., "5m ago", "Yesterday", "14/12/24")
const getRelativeTimeString = (
  date: Date,
  millisecondsDiff: number,
  useCompactFormat: boolean
): string => {
  const minutesAgo = Math.floor(millisecondsDiff / MILLISECONDS_PER_MINUTE);
  const hoursAgo = Math.floor(millisecondsDiff / MILLISECONDS_PER_HOUR);
  const daysAgo = Math.floor(millisecondsDiff / MILLISECONDS_PER_DAY);

  if (minutesAgo < 1) {
    return useCompactFormat ? "Now" : "Just now";
  }

  if (minutesAgo < MINUTES_PER_HOUR) {
    return useCompactFormat ? `${minutesAgo}m` : `${minutesAgo}m ago`;
  }

  if (hoursAgo < HOURS_PER_DAY) {
    return useCompactFormat ? `${hoursAgo}h` : `${hoursAgo}h ago`;
  }

  if (daysAgo === 1) {
    return "Yesterday";
  }

  return getEuropeanDateString(date, !useCompactFormat);
};

// Public API - Exported formatters

// Format for message detail timestamps (e.g., "5m ago", "Yesterday", "14/12/24")
export const formatMessageTime = (timestamp: string | null): string => {
  if (!timestamp) return "";

  const messageDate = new Date(timestamp);
  const timeDifference = Date.now() - messageDate.getTime();

  return getRelativeTimeString(messageDate, timeDifference, false);
};

// Format for conversation list timestamps (e.g., "14:30", "Yesterday", "14/12")
export const formatConversationTime = (timestamp: string | null): string => {
  if (!timestamp) return "";

  const messageDate = new Date(timestamp);
  const currentDate = new Date();

  if (areSameDay(messageDate, currentDate)) {
    return getClockTime(messageDate);
  }

  const timeDifference = currentDate.getTime() - messageDate.getTime();
  const daysAgo = Math.floor(timeDifference / MILLISECONDS_PER_DAY);

  if (daysAgo === 1) {
    return "Yesterday";
  }

  return getEuropeanDateString(messageDate);
};

// Format 24-hour clock time (e.g., "14:30")
export const formatFullTime = (timestamp: string | null): string => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  return getClockTime(date);
};

// Format session divider timestamps (e.g., "Thu, 14:30", "14/12, 14:30")
export const formatMessageSessionTime = (timestamp: string | null): string => {
  if (!timestamp) return "";

  const messageDate = new Date(timestamp);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - messageDate.getTime();
  const daysAgo = Math.floor(timeDifference / MILLISECONDS_PER_DAY);

  const clockTime = getClockTime(messageDate);

  // Today: show only time
  if (areSameDay(messageDate, currentDate)) {
    return clockTime;
  }

  // Within last week: show weekday and time
  if (daysAgo < DAYS_IN_WEEK) {
    const weekdayName = WEEKDAY_NAMES[messageDate.getDay()];
    return `${weekdayName}, ${clockTime}`;
  }

  // Older: show date and time
  const dateString = getEuropeanDateString(messageDate);
  return `${dateString}, ${clockTime}`;
};
