/**
 * Utility functions for handling dates in the D&D Map App
 * These functions help handle the fact that dates from localStorage are strings
 */

/**
 * Safely converts a date (which might be a string from localStorage) to a Date object
 */
export const safeDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

/**
 * Formats a date for display, handling both Date objects and strings
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = safeDate(date);
  return dateObj.toLocaleDateString(undefined, options);
};

/**
 * Formats a date with time for display
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = safeDate(date);
  return dateObj.toLocaleString();
};

/**
 * Gets a relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = safeDate(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Checks if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = safeDate(date);
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Checks if a date is yesterday
 */
export const isYesterday = (date: Date | string): boolean => {
  const dateObj = safeDate(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateObj.toDateString() === yesterday.toDateString();
};

/**
 * Gets a smart date display (today, yesterday, or formatted date)
 */
export const getSmartDateDisplay = (date: Date | string): string => {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return formatDate(date);
};
