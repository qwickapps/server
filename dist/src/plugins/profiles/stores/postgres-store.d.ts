/**
 * PostgreSQL Profile Store
 *
 * Profile storage implementation using PostgreSQL.
 * Includes automatic age group calculation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { ProfileStore, PostgresProfileStoreConfig, AgeThresholds } from '../types.js';
/**
 * Create a PostgreSQL profile store
 *
 * @param config Configuration including a pg Pool instance
 * @param ageThresholds Optional age thresholds for categorization
 * @returns ProfileStore implementation
 */
export declare function postgresProfileStore(config: PostgresProfileStoreConfig, ageThresholds?: AgeThresholds): ProfileStore;
//# sourceMappingURL=postgres-store.d.ts.map