/**
 * Formatting Utilities
 *
 * Common formatting functions for numbers, durations, and strings.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

/**
 * Format a number with K/M suffix for large values
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format milliseconds to human-readable duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(0)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Truncate a string ID for display
 */
export function truncateId(id: string, maxLength = 12): string {
  return id.length > maxLength ? `${id.substring(0, maxLength)}...` : id;
}
