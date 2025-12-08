const TRUNCATION_SUFFIX = "...";

export const truncateMessage = (content: string, maxLength: number) =>
  content.length <= maxLength
    ? content
    : `${content.substring(0, maxLength)}${TRUNCATION_SUFFIX}`;
