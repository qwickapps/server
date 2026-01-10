/**
 * Kids Parental Adapter
 *
 * Adapter for child safety and parental controls in apps like QwickBot.
 * Focuses on content filtering, time limits, and activity monitoring.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { ParentalAdapter } from '../types.js';
export interface KidsAdapterConfig {
    /** Default daily time limit in minutes */
    defaultDailyLimit?: number;
    /** Minimum allowed age */
    minAge?: number;
    /** Maximum allowed age */
    maxAge?: number;
    /** Custom activity types */
    customActivityTypes?: string[];
}
/**
 * Create a kids parental adapter
 */
export declare function kidsAdapter(config?: KidsAdapterConfig): ParentalAdapter;
//# sourceMappingURL=kids-adapter.d.ts.map