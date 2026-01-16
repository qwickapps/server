/**
 * pg-mem Pool Adapter
 *
 * Provides a pg.Pool-compatible interface for pg-mem (in-memory PostgreSQL).
 * Used by demos to run without requiring an actual PostgreSQL installation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { newDb } from 'pg-mem';

/**
 * Create an in-memory PostgreSQL database with a Pool-compatible interface
 *
 * @returns Pool-compatible interface backed by pg-mem
 */
export function createPgMemPool() {
  const db = newDb();

  // Get the Pool-compatible adapter from pg-mem
  const { Pool } = db.adapters.createPg();
  const pool = new Pool();

  // Add a fake connection string for plugins that need it (like notifications)
  // pg-mem doesn't use connection strings, but some plugins try to extract it
  (pool as any).options = {
    connectionString: 'postgresql://localhost/pgmem',
  };

  console.log('[pg-mem] In-memory PostgreSQL database created');

  return pool;
}
