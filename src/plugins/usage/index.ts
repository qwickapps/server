/**
 * Usage Plugin
 *
 * Usage tracking with daily/monthly counters.
 * Exports all usage-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Main plugin
export {
  createUsagePlugin,
  getUsageStore,
  getDailyUsage,
  incrementUsage,
  checkUsageLimit,
  getFeatureUsageStatus,
  getDailyUsageSummary,
  resetUsage,
  getRemainingQuota,
  canUseFeature,
} from './usage-plugin.js';

// Types
export type {
  DailyUsage,
  MonthlyUsage,
  UsageIncrementResult,
  UsageStatus,
  UsageSummary,
  UsageStore,
  UsagePluginConfig,
  UsageApiConfig,
  UsageCleanupConfig,
  PostgresUsageStoreConfig,
} from './types.js';

// Stores
export { postgresUsageStore } from './stores/index.js';

// UI Components
export { UsageStatusWidget } from './UsageStatusWidget.js';
export type { UsageStatusWidgetProps } from './UsageStatusWidget.js';
export { UsageManagementPage } from './UsageManagementPage.js';
export type { UsageManagementPageProps } from './UsageManagementPage.js';
